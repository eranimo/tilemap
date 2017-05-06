//@flow
import type Viewport from './viewport';
import Point from './point';
import type World from './world';
import _ from 'lodash';
import {
  CELL_SIZE,
  SCENE_CELLS_WIDTH,
  SCENE_CELLS_HEIGHT,
} from './constants';


export default class Region {
  world: World;
  ctx: CanvasRenderingContext2D;
  canvas: HTMLElement;
  viewport: Viewport;
  boardRect: Object;

  constructor(world: World, canvas: HTMLElement, viewport: Viewport) {
    this.world = world;
    this.canvas = canvas;
    this.viewport = viewport;

    // $FlowFixMe
    this.ctx = canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.translate(0.5, 0.5);
  }

  get boardRect(): Object {
    return {
      topLeft: new Point(this.viewport.topLeft.x, this.viewport.topLeft.y),
      bottomRight: new Point(this.viewport.bottomRight.x, this.viewport.bottomRight.y),
    };
  }

  draw(timeSinceLastUpdate: number) {
    const ctx = this.ctx;
    const viewport = this.viewport;

    this.ctx.fillStyle = 'white';
    const { width, height } = this.viewport.viewportSize;
    this.ctx.fillRect(0, 0, width, height);


    // grid
    for (let x = 0; x <= SCENE_CELLS_WIDTH; x++) {
      let pointFrom: Point = new Point(x * CELL_SIZE, 0);
      let pointTo: Point = new Point(
        x * CELL_SIZE,
        SCENE_CELLS_WIDTH * CELL_SIZE,
      );

      const intersect = this.calculateGridLine(
        pointFrom,
        pointTo,
      );
      if (intersect) {
        this.drawGridLine(intersect.from, intersect.to);
      }
    }

    for (let y = 0; y <= SCENE_CELLS_HEIGHT; y++) {
      let pointFrom: Point = new Point(0, y * CELL_SIZE);
      let pointTo: Point = new Point(
        SCENE_CELLS_WIDTH * CELL_SIZE,
        y * CELL_SIZE
      );

      const intersect = this.calculateGridLine(
        pointFrom,
        pointTo,
      );
      if (intersect) {
        this.drawGridLine(intersect.from, intersect.to);
      }
    }

    const cursor = viewport.cursorLocation;
    ctx.font = '20px sans-serif';
    ctx.fillStyle = '#333';
    ctx.fillText(`Cursor: (${cursor.x}, ${cursor.y})`, 0, 20);
    const cursorWorld = viewport.viewportToWorld(viewport.cursorLocation);
    ctx.fillText(`World: (${cursorWorld.x}, ${cursorWorld.y})`, 0, 2 * 20);
    ctx.fillText(`Top Left: (${viewport.topLeft.x}, ${viewport.topLeft.y})`, 0, 3 * 20);
    ctx.fillText(`Bottom Right: (${viewport.bottomRight.x}, ${viewport.bottomRight.y})`, 0, 4 * 20);
    if (viewport.cellHover){
      ctx.fillText(`Cell Hover: (${viewport.cellHover.x}, ${viewport.cellHover.y})`, 0, 5 * 20);
    }
    ctx.fillText(`FPS: (${timeSinceLastUpdate})`, 0, 6 * 20);
    ctx.fillText(`Time Δ (s): (${Math.round(this.world.time / 1000)})`, 0, 7 * 20);


    // draw hover cell
    this.drawCursor();
  }

  drawCursor() {
    this.ctx.beginPath();
    this.ctx.strokeStyle = 'black';
    this.ctx.lineWidth = this.viewport.toZoom(1);
    const cellSize = this.viewport.toZoom(CELL_SIZE);
    if (!this.viewport.cellHover) {
      return;
    }
    const cellHoverViewport = this.viewport.worldToViewport(new Point(
      this.viewport.cellHover.x * CELL_SIZE,
      this.viewport.cellHover.y * CELL_SIZE,
    ));
    this.ctx.rect(
      cellHoverViewport.x,
      cellHoverViewport.y,
      cellSize,
      cellSize,
    );
    this.ctx.stroke();
  }

  // calculate a line in world coordinates
  // will return the end points of the line in viewport coordinates
  calculateGridLine(from: Point, to: Point): Object {
    let newFrom = new Point(
      _.clamp(from.x, 0, this.viewport.sceneSize.width),
      _.clamp(from.y, 0, this.viewport.sceneSize.height),
    );
    let newTo = new Point(
      _.clamp(to.x, 0, this.viewport.sceneSize.width),
      _.clamp(to.y, 0, this.viewport.sceneSize.height),
    );
    newFrom = this.viewport.worldToViewport(newFrom);
    newTo = this.viewport.worldToViewport(newTo);
    return { from: newFrom, to: newTo };
  }

  drawGridLine(from: Point, to: Point) {
    this.ctx.beginPath();
    this.ctx.strokeStyle = 'rgba(150, 150, 150, 1)';
    this.ctx.lineWidth = this.viewport.toZoom(0.5);
    this.ctx.moveTo(
      0 + Math.round(to.x),
      0 + Math.round(to.y),
    );
    this.ctx.lineTo(
      0 + Math.round(from.x),
      0 + Math.round(from.y),
    );
    this.ctx.stroke();
  }
}