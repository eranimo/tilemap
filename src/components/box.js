// @flow
import { Component } from '../entityManager';
import Point from '../geometry/point';
import Viewport from '../viewport';
import { CELL_SIZE } from '../constants';
import EventTrigger from './eventTrigger';
import Color from '../utils/color';
import type { GridCell } from './gridCell';


export class Box extends Component {
  state: {
    position: Point,
    color: Color,
    opacity: number,
  };
  cell: GridCell;

  static initialState = {
    color: new Color(0, 0, 255),
    opacity: 1,
  }
  static dependencies = {
    cell: 'GridCell',
  }

  draw(viewport: Viewport, ctx: CanvasRenderingContext2D) {
    const { color, opacity } = this.state;
    const { position: { x, y } } = this.cell.state;
    ctx.fillStyle = color.setAlpha(opacity).toRGBA(opacity);

    const intersect = viewport.calculateBounds(
      new Point(x * CELL_SIZE, y * CELL_SIZE),
      CELL_SIZE,
      CELL_SIZE,
    );
    if (intersect) {
      ctx.fillRect(
        intersect.topLeft.x,
        intersect.topLeft.y,
        intersect.width,
        intersect.height,
      );
    }
  }
}


export class BoxTrigger extends EventTrigger {
  static dependencies = {
    box: 'Box',
  }
  box: Box;

  onMouseEnter() {
    this.box.state.opacity = 0.5;
  }

  onMouseLeave() {
    this.box.state.opacity = 1;
  }

  onMouseUp() {
    this.box.state.color = Color.random();
  }
}
