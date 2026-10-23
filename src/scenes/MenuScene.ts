import Phaser from 'phaser';
import { createArt, drawBackdrop } from '../art';
import { GAME_HEIGHT, GAME_WIDTH, HIGH_SCORE_KEY } from '../config';

function addButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  height: number,
  label: string,
  action: () => void,
  color = 0xffbf38
): void {
  const button = scene.add.rectangle(x, y, width, height, color).setStrokeStyle(4, 0xffffff);
  button.setInteractive({ useHandCursor: true });
  button.on('pointerover', () => button.setScale(1.04));
  button.on('pointerout', () => button.setScale(1));
  button.on('pointerdown', action);
  scene.add.text(x, y, label, {
    fontFamily: 'Trebuchet MS, sans-serif',
    fontSize: '26px',
    color: '#563b2b',
    fontStyle: 'bold',
    stroke: '#fff8df',
    strokeThickness: 1
  }).setOrigin(0.5).setDepth(1);
}

export class MenuScene extends Phaser.Scene {
  private instructions!: Phaser.GameObjects.Container;
  private instructionShade!: Phaser.GameObjects.Rectangle;
  private instructionClose!: Phaser.GameObjects.Text;
  private enterKey?: Phaser.Input.Keyboard.Key;
  private instructionsKey?: Phaser.Input.Keyboard.Key;

  constructor() {
    super('MenuScene');
  }

  create(): void {
    createArt(this);
    drawBackdrop(this);
    this.cameras.main.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT);

    const hero = this.add.image(GAME_WIDTH / 2, 267, 'hero-idle').setScale(1.35);
    this.tweens.add({ targets: hero, y: 256, duration: 780, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    const star = this.add.image(GAME_WIDTH / 2 + 95, 235, 'star').setScale(0.72);
    this.tweens.add({ targets: star, angle: 360, duration: 5000, repeat: -1 });
    this.tweens.add({ targets: star, y: 222, duration: 630, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

    this.add.text(GAME_WIDTH / 2, 73, 'ATRAPA LAS', {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '29px',
      color: '#fff9dc',
      fontStyle: 'bold',
      stroke: '#30527b',
      strokeThickness: 8
    }).setOrigin(0.5);
    this.add.text(GAME_WIDTH / 2, 116, 'ESTRELLAS', {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '52px',
      color: '#fff1a4',
      fontStyle: 'bold',
      stroke: '#a2543e',
      strokeThickness: 10,
      shadow: { color: '#653d50', blur: 0, offsetX: 0, offsetY: 7, fill: true }
    }).setOrigin(0.5);

    const card = this.add.rectangle(GAME_WIDTH / 2, 410, 460, 220, 0x28557a, 0.86)
      .setStrokeStyle(5, 0xffffff);
    card.setDepth(0);
    const best = Number(localStorage.getItem(HIGH_SCORE_KEY) ?? '0');
    this.add.text(GAME_WIDTH / 2, 340, `RÉCORD  ✦  ${best}`, {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '19px',
      color: '#fff7d8',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(1);

    addButton(this, GAME_WIDTH / 2, 398, 240, 58, 'JUGAR  ✦', this.startGame);
    addButton(this, GAME_WIDTH / 2, 469, 240, 48, 'INSTRUCCIONES', () => {
      this.toggleInstructions();
    }, 0x9be9c1);

    const shade = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x15324e, 0.65)
      .disableInteractive();
    const panel = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 550, 270, 0x28557a)
      .setStrokeStyle(5, 0xffffff);
    const copy = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 16,
      '← →  o  A / D     moverse\n↑  W  o  ESPACIO     saltar\nESC  o  botón II     pausar\n\n¡Atrapa estrellas y evita a los bichitos!', {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '22px',
        color: '#ffffff',
        align: 'center',
        lineSpacing: 8
      }).setOrigin(0.5);
    const close = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 96, 'ENTENDIDO', {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '19px',
      color: '#fff1a4',
      fontStyle: 'bold'
    }).setOrigin(0.5).disableInteractive();
    this.instructions = this.add.container(0, 0, [shade, panel, copy, close]).setDepth(20).setVisible(false);
    this.instructionShade = shade;
    this.instructionClose = close;
    shade.on('pointerdown', () => this.toggleInstructions());
    close.on('pointerdown', () => this.toggleInstructions());
    const keyboard = this.input.keyboard;
    if (keyboard) {
      this.enterKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
      this.instructionsKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I);
    }
  }

  update(): void {
    if (this.enterKey && Phaser.Input.Keyboard.JustDown(this.enterKey)) this.startGame();
    if (this.instructionsKey && Phaser.Input.Keyboard.JustDown(this.instructionsKey)) this.toggleInstructions();
  }

  private startGame = (): void => {
    this.scene.start('GameScene', { score: 0, lives: 3, level: 1 });
  };

  private toggleInstructions(): void {
    const visible = !this.instructions.visible;
    this.instructions.setVisible(visible);
    if (visible) {
      this.instructionShade.setInteractive();
      this.instructionClose.setInteractive({ useHandCursor: true });
    } else {
      this.instructionShade.disableInteractive();
      this.instructionClose.disableInteractive();
    }
  }
}
