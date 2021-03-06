//@flow
import type ViewportSystem from './viewport';
import Point from '../geometry/point';
import type World from '../world';
import System from '../engine/system';
import { VIEWPORT_MOVE } from '../events';
import _ from 'lodash';
import {
  CELL_SIZE,
  SCENE_CELLS_WIDTH,
  SCENE_CELLS_HEIGHT,
} from '../constants';
import Layer from '../misc/layer';


export default class Region extends System {
  world: World;

  gridLayer: Layer;
  terrainLayer: Layer;
  mainLayer: Layer;

  boardRect: Object;
  viewport: ViewportSystem;
  options: Object;

  init() {
    this.viewport = this.systems.viewport;
    this.options = {};
    this.terrainLayer = new Layer('terrain', 1);
    this.gridLayer = new Layer('grid', 2);
    this.mainLayer = new Layer('main', 3);

    this.systems.viewport.on(VIEWPORT_MOVE, () => {
      this.terrainLayer.clear();
    });
  }

  get boardRect(): Object {
    return {
      topLeft: new Point(this.viewport.topLeft.x, this.viewport.topLeft.y),
      bottomRight: new Point(this.viewport.bottomRight.x, this.viewport.bottomRight.y),
    };
  }

  draw(timeSinceLastUpdate: number) {
    this.gridLayer.clear();
    this.mainLayer.clear();

    // this.drawGrid();
    this.drawDevInfo(timeSinceLastUpdate);
    // draw hover cell
    // this.drawCursor();
  }

  drawDevInfo(timeSinceLastUpdate: number) {
    const viewport = this.viewport;

    const cursor = viewport.cursorLocation;
    this.gridLayer.ctx.font = '20px sans-serif';
    this.gridLayer.ctx.fillStyle = '#333';
    this.gridLayer.ctx.fillText(`Cursor: (${cursor.x}, ${cursor.y})`, 0, 20);
    const cursorWorld = viewport.viewportToWorld(viewport.cursorLocation);
    this.gridLayer.ctx.fillText(`World: (${cursorWorld.x}, ${cursorWorld.y})`, 0, 2 * 20);
    this.gridLayer.ctx.fillText(`Top Left: (${viewport.topLeft.x}, ${viewport.topLeft.y})`, 0, 3 * 20);
    this.gridLayer.ctx.fillText(`Bottom Right: (${viewport.bottomRight.x}, ${viewport.bottomRight.y})`, 0, 4 * 20);
    if (viewport.cellHover){
      this.gridLayer.ctx.fillText(`Cell Hover: (${viewport.cellHover.x}, ${viewport.cellHover.y})`, 0, 5 * 20);
    }
    this.gridLayer.ctx.fillText(`ms/frame: (${timeSinceLastUpdate})`, 0, 6 * 20);
    this.gridLayer.ctx.fillText(`Time Δ (s): (${Math.round(this.systems.time.time / 1000)})`, 0, 7 * 20);
  }

  drawGrid() {
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
  }

  drawCursor() {
    this.gridLayer.ctx.beginPath();
    this.gridLayer.ctx.strokeStyle = 'black';
    this.gridLayer.ctx.lineWidth = this.viewport.toZoom(1);
    const cellSize = this.viewport.toZoom(CELL_SIZE);
    if (!this.viewport.cellHover) {
      return;
    }
    const cellHoverViewport = this.viewport.worldToViewport(new Point(
      this.viewport.cellHover.x * CELL_SIZE,
      this.viewport.cellHover.y * CELL_SIZE,
    ));
    this.gridLayer.ctx.rect(
      cellHoverViewport.x,
      cellHoverViewport.y,
      cellSize,
      cellSize,
    );
    this.gridLayer.ctx.stroke();
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
    this.gridLayer.ctx.beginPath();
    this.gridLayer.ctx.strokeStyle = 'rgba(30, 30, 30, 1)';
    this.gridLayer.ctx.lineWidth = this.viewport.toZoom(0.5);
    this.gridLayer.ctx.moveTo(
      Math.round(to.x),
      Math.round(to.y),
    );
    this.gridLayer.ctx.lineTo(
      Math.round(from.x),
      Math.round(from.y),
    );
    this.gridLayer.ctx.stroke();
  }
}
