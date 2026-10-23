import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from './config';

function makeHero(scene: Phaser.Scene, key: string, pose: 'idle' | 'runA' | 'runB' | 'jump' | 'fall'): void {
  const g = scene.make.graphics({ x: 0, y: 0 });
  g.fillStyle(0xffffff);
  g.fillRoundedRect(4, 3, 56, 65, 21);
  g.fillStyle(0x3478e5);
  g.fillRoundedRect(8, 7, 48, 57, 18);
  g.fillStyle(0x79bdff, 0.8);
  g.fillRoundedRect(13, 11, 34, 10, 5);
  g.fillStyle(0x193254);
  g.fillRoundedRect(17, 27, 8, 12, 4);
  g.fillRoundedRect(39, 27, 8, 12, 4);
  g.fillStyle(0xffffff);
  g.fillCircle(20, 29, 2);
  g.fillCircle(42, 29, 2);
  g.lineStyle(3, 0x193254, 1);
  g.beginPath();
  g.arc(32, 39, 7, 0.25, Math.PI - 0.25, false);
  g.strokePath();
  g.fillStyle(0xff8ca6);
  g.fillEllipse(13, 43, 8, 5);
  g.fillEllipse(51, 43, 8, 5);
  g.fillStyle(0x234e9e);
  if (pose === 'runA') {
    g.fillRoundedRect(13, 56, 17, 10, 5);
    g.fillRoundedRect(34, 52, 17, 10, 5);
  } else if (pose === 'runB') {
    g.fillRoundedRect(12, 52, 17, 10, 5);
    g.fillRoundedRect(35, 56, 17, 10, 5);
  } else if (pose === 'jump' || pose === 'fall') {
    g.fillRoundedRect(10, 52, 20, 9, 5);
    g.fillRoundedRect(34, 52, 20, 9, 5);
  } else {
    g.fillRoundedRect(13, 57, 17, 9, 5);
    g.fillRoundedRect(34, 57, 17, 9, 5);
  }
  g.lineStyle(3, 0xffffff, 0.75);
  g.beginPath();
  g.moveTo(16, 15);
  g.lineTo(28, 11);
  g.strokePath();
  g.generateTexture(key, 64, 72);
  g.destroy();
}

export function createArt(scene: Phaser.Scene): void {
  if (!scene.textures.exists('hero-idle')) {
    makeHero(scene, 'hero-idle', 'idle');
    makeHero(scene, 'hero-run-a', 'runA');
    makeHero(scene, 'hero-run-b', 'runB');
    makeHero(scene, 'hero-jump', 'jump');
    makeHero(scene, 'hero-fall', 'fall');

    const g = scene.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0xffffff);
    g.fillRoundedRect(0, 0, 164, 40, 12);
    g.fillStyle(0x7a4b35);
    g.fillRoundedRect(3, 5, 158, 33, 10);
    g.fillStyle(0x45c982);
    g.fillRoundedRect(0, 0, 164, 19, 10);
    g.fillStyle(0x98f1b7);
    g.fillRoundedRect(13, 4, 43, 4, 2);
    g.fillRoundedRect(70, 4, 25, 4, 2);
    g.generateTexture('platform', 164, 40);

    g.clear();
    g.fillStyle(0xffffff);
    g.fillCircle(18, 18, 18);
    g.fillStyle(0xffbf38);
    g.fillCircle(18, 18, 14);
    g.fillStyle(0xffe984);
    g.fillCircle(13, 12, 4);
    g.fillStyle(0x553b32);
    g.fillCircle(14, 19, 2);
    g.fillCircle(23, 19, 2);
    g.lineStyle(2, 0x553b32);
    g.beginPath();
    g.arc(18, 21, 5, 0.2, Math.PI - 0.2);
    g.strokePath();
    g.generateTexture('baddie', 36, 36);

    g.clear();
    g.fillStyle(0xffffff);
    g.fillCircle(6, 6, 6);
    g.fillStyle(0xfff5a0);
    g.fillCircle(6, 6, 3);
    g.generateTexture('spark', 12, 12);

    g.clear();
    const star = (cx: number, cy: number, outer: number, inner: number): Phaser.Geom.Point[] => {
      const points: Phaser.Geom.Point[] = [];
      for (let i = 0; i < 10; i += 1) {
        const radius = i % 2 === 0 ? outer : inner;
        const angle = -Math.PI / 2 + (i * Math.PI) / 5;
        points.push(new Phaser.Geom.Point(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius));
      }
      return points;
    };
    const points = star(24, 24, 22, 10);
    g.fillStyle(0xffffff);
    g.fillPoints(star(24, 24, 24, 11), true);
    g.fillStyle(0xffc72c);
    g.fillPoints(points, true);
    g.lineStyle(2, 0xf58b22, 1);
    g.strokePoints(points, true);
    g.fillStyle(0xfff4a0);
    g.fillCircle(19, 16, 4);
    g.generateTexture('star', 48, 48);
    g.destroy();
  }

  if (!scene.anims.exists('hero-run')) {
    scene.anims.create({
      key: 'hero-run',
      frames: [{ key: 'hero-run-a' }, { key: 'hero-run-b' }],
      frameRate: 8,
      repeat: -1
    });
  }
}

export function drawBackdrop(scene: Phaser.Scene): void {
  scene.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x8ddcff).setDepth(-100);
  scene.add.circle(790, 105, 64, 0xfff4a3, 0.42).setDepth(-95);
  scene.add.circle(790, 105, 43, 0xfff8c6, 0.92).setDepth(-94);

  const far = scene.add.graphics().setDepth(-92).setScrollFactor(0.12);
  far.fillStyle(0x96c9ee, 1);
  far.fillPoints([
    new Phaser.Geom.Point(0, 390), new Phaser.Geom.Point(115, 232),
    new Phaser.Geom.Point(252, 390), new Phaser.Geom.Point(395, 205),
    new Phaser.Geom.Point(556, 390), new Phaser.Geom.Point(700, 248),
    new Phaser.Geom.Point(850, 390), new Phaser.Geom.Point(960, 260),
    new Phaser.Geom.Point(960, GAME_HEIGHT), new Phaser.Geom.Point(0, GAME_HEIGHT)
  ], true);
  const near = scene.add.graphics().setDepth(-91).setScrollFactor(0.22);
  near.fillStyle(0x76b8d6, 0.7);
  near.fillPoints([
    new Phaser.Geom.Point(0, 440), new Phaser.Geom.Point(160, 330),
    new Phaser.Geom.Point(315, 440), new Phaser.Geom.Point(500, 300),
    new Phaser.Geom.Point(670, 440), new Phaser.Geom.Point(820, 325),
    new Phaser.Geom.Point(960, 438), new Phaser.Geom.Point(960, GAME_HEIGHT),
    new Phaser.Geom.Point(0, GAME_HEIGHT)
  ], true);
  for (const cloud of [
    { x: 145, y: 130, scale: 1 },
    { x: 480, y: 95, scale: 0.72 },
    { x: 680, y: 190, scale: 0.58 }
  ]) {
    const puff = scene.add.container(cloud.x, cloud.y).setDepth(-90).setScrollFactor(0.1);
    puff.add([
      scene.add.ellipse(-27, 4, 48, 25, 0xffffff, 0.76),
      scene.add.ellipse(0, -6, 54, 34, 0xffffff, 0.86),
      scene.add.ellipse(29, 4, 43, 24, 0xffffff, 0.76),
      scene.add.ellipse(1, 11, 67, 20, 0xffffff, 0.9)
    ]);
    puff.setScale(cloud.scale);
  }
}
