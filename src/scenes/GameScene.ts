import Phaser from 'phaser';
import { createArt, drawBackdrop } from '../art';
import { GameAudio } from '../audio';
import { GAME_HEIGHT, GAME_WIDTH, HIGH_SCORE_KEY } from '../config';

interface StartData {
  score: number;
  lives: number;
  level: number;
}

const STAR_TARGET = 8;
const LAST_LEVEL = 5;

export class GameScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private stars!: Phaser.Physics.Arcade.Group;
  private enemies!: Phaser.Physics.Arcade.Group;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyA!: Phaser.Input.Keyboard.Key;
  private keyD!: Phaser.Input.Keyboard.Key;
  private keyW!: Phaser.Input.Keyboard.Key;
  private keySpace!: Phaser.Input.Keyboard.Key;
  private keyEscape!: Phaser.Input.Keyboard.Key;
  private scoreText!: Phaser.GameObjects.Text;
  private livesText!: Phaser.GameObjects.Text;
  private progressText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private levelMessage?: Phaser.GameObjects.Text;
  private touch = { left: false, right: false, jump: false };
  private score = 0;
  private lives = 3;
  private level = 1;
  private invulnerableUntil = 0;
  private transitioning = false;
  private audio = new GameAudio();
  private dust!: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor() {
    super('GameScene');
  }

  init(data: object): void {
    if ('score' in data && typeof data.score === 'number') this.score = data.score;
    else this.score = 0;
    if ('lives' in data && typeof data.lives === 'number') this.lives = data.lives;
    else this.lives = 3;
    if ('level' in data && typeof data.level === 'number') this.level = data.level;
    else this.level = 1;
    this.transitioning = false;
    this.invulnerableUntil = 0;
    this.touch = { left: false, right: false, jump: false };
  }

  create(): void {
    createArt(this);
    drawBackdrop(this);
    this.cameras.main.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT);
    this.physics.world.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT + 100);
    this.physics.world.setBoundsCollision(true, true, true, false);
    this.audio.start();
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.audio.stop());

    this.platforms = this.physics.add.staticGroup();
    this.stars = this.physics.add.group({ allowGravity: false, immovable: true });
    this.enemies = this.physics.add.group({ allowGravity: false, immovable: true });
    this.player = this.physics.add.sprite(250, 470, 'hero-idle');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.04);
    this.player.setSize(38, 54).setOffset(13, 14);
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.stars, this.platforms);
    this.physics.add.overlap(this.player, this.stars, this.collectStar, undefined, this);
    this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, undefined, this);

    this.dust = this.add.particles(0, 0, 'spark', {
      speed: { min: 60, max: 180 },
      angle: { min: 200, max: 340 },
      lifespan: 450,
      scale: { start: 0.8, end: 0 },
      gravityY: 220,
      quantity: 9,
      emitting: false
    }).setDepth(8);

    this.createHud();
    this.createTouchControls();
    this.buildLevel();
    const keyboard = this.input.keyboard;
    if (!keyboard) throw new Error('Keyboard input is unavailable.');
    this.cursors = keyboard.createCursorKeys();
    this.keyA = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyD = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keyW = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keySpace = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.keyEscape = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.input.on('pointerup', this.releaseTouch, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.off('pointerup', this.releaseTouch, this);
    });
  }

  update(time: number): void {
    if (Phaser.Input.Keyboard.JustDown(this.keyEscape)) this.pauseGame();
    if (this.transitioning) return;

    const body = this.player.body;
    if (!body) return;
    const left = this.cursors.left.isDown || this.keyA.isDown || this.touch.left;
    const right = this.cursors.right.isDown || this.keyD.isDown || this.touch.right;
    const grounded = body.blocked.down || body.touching.down;
    const jumpPressed = Phaser.Input.Keyboard.JustDown(this.cursors.up)
      || Phaser.Input.Keyboard.JustDown(this.keyW)
      || Phaser.Input.Keyboard.JustDown(this.keySpace)
      || this.touch.jump;
    this.touch.jump = false;

    if (left === right) this.player.setVelocityX(0);
    else {
      this.player.setVelocityX(left ? -270 : 270);
      this.player.setFlipX(left);
    }
    if (jumpPressed && grounded) {
      this.player.setVelocityY(-485);
      this.audio.play('jump');
      this.dust.explode(7, this.player.x, this.player.y + 27);
    }

    if (!grounded) this.player.setTexture(body.velocity.y < 0 ? 'hero-jump' : 'hero-fall');
    else if (left !== right) this.player.play('hero-run', true);
    else {
      this.player.anims.stop();
      this.player.setTexture('hero-idle');
    }

    this.enemies.getChildren().forEach((child) => {
      if (!(child instanceof Phaser.Physics.Arcade.Sprite)) return;
      const enemy = child;
      const enemyBody = enemy.body;
      if (!enemyBody) return;
      if (enemy.x < 90 || enemy.x > GAME_WIDTH - 90) enemy.setVelocityX(-enemyBody.velocity.x);
      enemy.setFlipX(enemyBody.velocity.x < 0);
    });

    if (this.player.y > GAME_HEIGHT + 60) this.loseLife(time);
    if (time < this.invulnerableUntil) this.player.setAlpha(Math.floor(time / 90) % 2 ? 0.45 : 1);
    else this.player.setAlpha(1);
  }

  private createHud(): void {
    this.add.rectangle(GAME_WIDTH / 2, 34, 610, 50, 0x244766, 0.88)
      .setStrokeStyle(3, 0xffffff).setDepth(10);
    this.scoreText = this.add.text(200, 34, '', this.hudStyle()).setOrigin(0.5).setDepth(11);
    this.livesText = this.add.text(360, 34, '', this.hudStyle()).setOrigin(0.5).setDepth(11);
    this.progressText = this.add.text(515, 34, '', this.hudStyle()).setOrigin(0.5).setDepth(11);
    this.levelText = this.add.text(715, 34, '', this.hudStyle()).setOrigin(0.5).setDepth(11);
    this.updateHud();

    const pause = this.add.rectangle(900, 35, 66, 50, 0x244766, 0.92)
      .setStrokeStyle(3, 0xffffff).setDepth(10).setInteractive({ useHandCursor: true });
    this.add.text(900, 35, 'Ⅱ', this.hudStyle()).setOrigin(0.5).setDepth(11);
    pause.on('pointerdown', () => this.pauseGame());
  }

  private hudStyle(): Phaser.Types.GameObjects.Text.TextStyle {
    return { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '19px', color: '#fff8df', fontStyle: 'bold' };
  }

  private createTouchControls(): void {
    const addControl = (x: number, label: string, key: 'left' | 'right' | 'jump'): void => {
      const button = this.add.circle(x, 468, 39, 0x28557a, 0.82)
        .setStrokeStyle(4, 0xffffff, 0.95)
        .setDepth(15)
        .setInteractive({ useHandCursor: true });
      this.add.text(x, 468, label, {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: key === 'jump' ? '16px' : '27px',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(16);
      button.on('pointerdown', () => {
        if (key === 'left') this.touch.left = true;
        else if (key === 'right') this.touch.right = true;
        else this.touch.jump = true;
      });
      button.on('pointerout', () => {
        if (key === 'left') this.touch.left = false;
        else if (key === 'right') this.touch.right = false;
      });
    };
    addControl(64, '◀', 'left');
    addControl(158, '▶', 'right');
    addControl(884, 'SALTAR', 'jump');
  }

  private releaseTouch(): void {
    this.touch.left = false;
    this.touch.right = false;
  }

  private buildLevel(): void {
    this.tweens.killTweensOf(this.stars.getChildren());
    this.platforms.clear(true, true);
    this.stars.clear(true, true);
    this.enemies.clear(true, true);

    const ground = this.platforms.create(GAME_WIDTH / 2, 523, 'platform')
      .setScale(6, 1);
    ground.refreshBody();

    const ledges = [
      { x: 145, y: 440 }, { x: 365, y: 354 }, { x: 605, y: 280 },
      { x: 830, y: 410 }, { x: 735, y: 180 }, { x: 425, y: 214 }, { x: 180, y: 284 }
    ];
    ledges.forEach(({ x, y }) => this.platforms.create(x, y, 'platform'));

    const starSpots = [
      { x: 285, y: 478 }, { x: 145, y: 396 }, { x: 365, y: 310 }, { x: 605, y: 236 },
      { x: 830, y: 366 }, { x: 735, y: 136 }, { x: 425, y: 170 }, { x: 180, y: 240 }
    ];
    starSpots.forEach(({ x, y }, index) => {
      const star = this.stars.create(x, y, 'star');
      star.setScale(0.72);
      star.setDepth(2);
      this.tweens.add({ targets: star, angle: index % 2 === 0 ? 18 : -18, duration: 600 + index * 35, yoyo: true, repeat: -1 });
      this.tweens.add({ targets: star, y: y - 7, duration: 760 + index * 25, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    });

    const enemyCount = Math.min(1 + Math.floor((this.level - 1) / 2), 3);
    for (let index = 0; index < enemyCount; index += 1) {
      const enemy = this.enemies.create(430 + index * 190, 493, 'baddie');
      enemy.setVelocityX(index % 2 === 0 ? 85 + this.level * 13 : -85 - this.level * 13);
      enemy.setSize(26, 25).setOffset(5, 7);
      enemy.setDepth(3);
    }
    this.player.setPosition(92, 470);
    this.player.setVelocity(0, 0);
    this.updateHud();
  }

  private collectStar = (_player: unknown, object: unknown): void => {
    if (!(object instanceof Phaser.Physics.Arcade.Sprite)) return;
    const star = object;
    if (!star.active) return;
    this.audio.play('collect');
    this.score += 10;
    this.dust.explode(18, star.x, star.y);
    star.disableBody(true, true);
    this.updateHud();

    if (this.stars.countActive(true) === 0 && !this.transitioning) {
      this.transitioning = true;
      this.player.setVelocity(0, 0);
      this.levelMessage = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, '¡NIVEL COMPLETADO!', {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '34px',
        color: '#fff5a0',
        fontStyle: 'bold',
        stroke: '#6b4b63',
        strokeThickness: 7
      }).setOrigin(0.5).setDepth(20);
      this.time.delayedCall(1100, () => {
        if (this.level >= LAST_LEVEL) this.finish(true);
        else {
          this.level += 1;
          this.transitioning = false;
          this.levelMessage?.setVisible(false);
          this.buildLevel();
        }
      });
    }
  };

  private hitEnemy = (): void => {
    this.loseLife(this.time.now);
  };

  private loseLife(time: number): void {
    if (time < this.invulnerableUntil || this.transitioning) return;
    this.lives -= 1;
    this.audio.play('hit');
    this.updateHud();
    if (this.lives <= 0) {
      this.finish(false);
      return;
    }
    this.invulnerableUntil = time + 1500;
    this.player.setPosition(250, 460);
    this.player.setVelocity(-140, -260);
    this.player.setTint(0xff8b8b);
    this.time.delayedCall(350, () => this.player.clearTint());
    this.dust.explode(10, this.player.x, this.player.y + 20);
  }

  private updateHud(): void {
    if (!this.scoreText) return;
    this.scoreText.setText(`✦ ${this.score}`);
    this.livesText.setText(`♥ ${this.lives}`);
    const collected = STAR_TARGET - (this.stars?.countActive(true) ?? STAR_TARGET);
    this.progressText.setText(`★ ${collected}/${STAR_TARGET}`);
    this.levelText.setText(`NIVEL ${this.level}/${LAST_LEVEL}`);
  }

  private pauseGame(): void {
    this.scene.launch('PauseScene');
    this.scene.pause();
  }

  private finish(won: boolean): void {
    const best = Math.max(this.score, Number(localStorage.getItem(HIGH_SCORE_KEY) ?? '0'));
    localStorage.setItem(HIGH_SCORE_KEY, String(best));
    this.scene.start('GameOverScene', { won, score: this.score, level: this.level, best });
  }
}
