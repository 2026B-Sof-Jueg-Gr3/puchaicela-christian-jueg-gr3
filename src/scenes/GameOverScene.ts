import Phaser from 'phaser';
import { drawBackdrop } from '../art';
import { GAME_HEIGHT, GAME_WIDTH } from '../config';

interface ResultData {
  won: boolean;
  score: number;
  level: number;
  best: number;
}

export class GameOverScene extends Phaser.Scene {
  private result: ResultData = { won: false, score: 0, level: 1, best: 0 };

  constructor() {
    super('GameOverScene');
  }

  init(data: object): void {
    if ('won' in data && 'score' in data && 'level' in data && 'best' in data
      && typeof data.won === 'boolean' && typeof data.score === 'number'
      && typeof data.level === 'number' && typeof data.best === 'number') {
      this.result = { won: data.won, score: data.score, level: data.level, best: data.best };
    }
  }

  create(): void {
    drawBackdrop(this);
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 520, 365, 0x28557a, 0.93)
      .setStrokeStyle(5, 0xffffff);
    this.add.text(GAME_WIDTH / 2, 135, this.result.won ? '¡VICTORIA!' : 'FIN DE LA PARTIDA', {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: this.result.won ? '43px' : '35px',
      color: this.result.won ? '#fff1a4' : '#fff8df',
      fontStyle: 'bold',
      stroke: '#684b60',
      strokeThickness: 7
    }).setOrigin(0.5);
    this.add.text(GAME_WIDTH / 2, 222,
      `Puntuación  ✦  ${this.result.score}\nRécord  ★  ${this.result.best}\nNivel alcanzado  ${this.result.level}`, {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '24px',
        color: '#ffffff',
        align: 'center',
        lineSpacing: 12
      }).setOrigin(0.5);
    this.makeButton(355, 365, 'JUGAR DE NUEVO', () => {
      this.scene.start('GameScene', { score: 0, lives: 3, level: 1 });
    }, 0xffbf38);
    this.makeButton(605, 365, 'VOLVER AL MENÚ', () => {
      this.scene.start('MenuScene');
    }, 0x9be9c1);
  }

  private makeButton(x: number, y: number, label: string, action: () => void, color: number): void {
    const button = this.add.rectangle(x, y, 210, 62, color).setStrokeStyle(4, 0xffffff)
      .setInteractive({ useHandCursor: true });
    this.add.text(x, y, label, {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '17px',
      color: '#563b2b',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5).setDepth(1);
    button.on('pointerover', () => button.setScale(1.04));
    button.on('pointerout', () => button.setScale(1));
    button.on('pointerdown', action);
  }
}
