import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config';

export class PauseScene extends Phaser.Scene {
  constructor() {
    super('PauseScene');
  }

  create(): void {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x102941, 0.7)
      .setInteractive();
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 420, 275, 0x28557a)
      .setStrokeStyle(5, 0xffffff);
    this.add.text(GAME_WIDTH / 2, 175, 'PAUSA', {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '48px',
      color: '#fff1a4',
      fontStyle: 'bold',
      stroke: '#684b60',
      strokeThickness: 7
    }).setOrigin(0.5);

    this.makeButton(480, 265, 'SEGUIR JUGANDO', () => this.resumeGame(), 0x9be9c1);
    this.makeButton(480, 345, 'VOLVER AL MENÚ', () => {
      this.scene.stop('GameScene');
      this.scene.start('MenuScene');
    }, 0xffbf38);

    this.input.keyboard?.once('keydown-ESC', () => this.resumeGame());
  }

  private makeButton(x: number, y: number, label: string, action: () => void, color: number): void {
    const button = this.add.rectangle(x, y, 270, 58, color).setStrokeStyle(4, 0xffffff)
      .setInteractive({ useHandCursor: true });
    const text = this.add.text(x, y, label, {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '20px',
      color: '#563b2b',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    button.on('pointerover', () => button.setScale(1.04));
    button.on('pointerout', () => button.setScale(1));
    button.on('pointerdown', action);
    text.setDepth(1);
  }

  private resumeGame(): void {
    this.scene.stop();
    this.scene.resume('GameScene');
  }
}
