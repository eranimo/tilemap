// @flow
import { System } from '../entityManager';
import type { Entity } from '../entityManager';

export default class SelectionSystem extends System {
  selected: Set<Entity>;

  init() {
    this.selected = new Set();
  }

  select(entity: Entity) {
    const name = entity.name || 'No Name';
    if (!entity.hasComponent('MapPosition')) {
      throw new Error(`Entity '${name}' must have a MapPosition component to be able to be selected`);
    }
    if (this.selected.has(entity)) {
      console.warn(`Entity '${name}' is already selected`);
    }
    console.log(`Selected '${name}'`);
    this.selected.add(entity);
  }

  deselect(entity: Entity) {
    const name = entity.name || 'No Name';
    if (this.selected.has(entity)) {
      console.log(`Deselected '${name}'`);
      this.selected.delete(entity);
      return;
    }
    console.warn(`Entity ${name} is not selected`);
  }

  toggle(entity: Entity) {
    if (this.selected.has(entity)) {
      this.deselect(entity);
    } else {
      this.select(entity);
    }
  }

  draw() {
    const ctx = this.systems.region.ctx;
    const viewport = this.systems.viewport;

    // draw selected entities
    for (const entity of this.selected) {
      const positions = entity.getComponents('MapPosition');
      if (positions.length === 1) {
        const mapPosition = positions[0];
        ctx.beginPath();
        ctx.strokeStyle = '#333';
        ctx.lineWidth = viewport.toZoom(2);
        mapPosition.drawBounds(ctx);
        ctx.stroke();
      }
    }
  }
}
