"use strict";

const { World, Engine, Runner, Render, Bodies, Body, Events } = Matter;

// Starting the engine and getting the world instance from it
const engine = Engine.create();
const { world } = engine;
// disabling gravity in y direction
engine.world.gravity.y = 0;

// const cells = 3;
// number of horizontal cells - AKA columns
let cellHorizontal = 14;
// number of vertical cells - AKA rows
let cellVertical = 10;

const width = window.innerWidth;
const height = window.innerHeight;
// const unitLength = width / cells;
const unitLengthX = width / cellHorizontal;
const unitLengthY = height / cellVertical;
const ballRadius = Math.min(unitLengthX, unitLengthY) / 4;

// Creating and configuring the renderer
const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    height,
    width,
    wireframes: false,
  },
});

// running the renderer
Render.run(render);

// creating and running the runner, runs about 60f/s and gets the world and engine to run together
const runner = Runner.create();
Runner.run(runner, engine);

// Creating shapes
//Walls -> top-bottom-left-right
const walls = [
  Bodies.rectangle(width / 2, 0, width, 2, { isStatic: true }),
  Bodies.rectangle(width / 2, height, width, 2, { isStatic: true }),
  Bodies.rectangle(0, height / 2, 2, height, { isStatic: true }),
  Bodies.rectangle(width, height / 2, 2, height, { isStatic: true }),
];

// adding shapes to the world instance
World.add(world, walls);

// maze generation using nested for loop
// let grid = [];
// for (let i = 0; i < 3; i++) {
//   grid.push([]); // maze gene
//   for (let j = 0; j < 4; j++) {
//     grid[i].push(false);
//   }
// }
// console.log(grid);

// Maze generation using Array constructor

// helper function to randomize array
const random = (arr) => {
  let counter = arr.length;
  while (counter > 0) {
    const randomIndex = Math.floor(Math.random() * arr.length);
    counter--;
    [arr[counter], arr[randomIndex]] = [arr[randomIndex], arr[counter]];

    // const temp = arr[counter];
    // arr[counter] = arr[randomIndex];
    // arr[randomIndex] = temp;
  }
  return arr;
};

let grid = Array(cellVertical) // this makes Rows
  .fill("")
  .map(() => Array(cellHorizontal).fill(false)); // this makes Columns

// Veritcal walls (verticals)
const verticals = Array(cellVertical)
  .fill("")
  .map(() => Array(cellHorizontal - 1).fill(false));
// console.log(verticals);
// Horizontal walls (horizontals)
const horizontals = Array(cellVertical - 1)
  .fill("")
  .map(() => Array(cellHorizontal).fill(false));
// console.log(horizontals);

// Algorithm
// Get a random cell
const startRow = Math.floor(Math.random() * cellVertical);
const startCol = Math.floor(Math.random() * cellHorizontal);

const stepThroughCells = (row, column) => {
  // Check if cell is visited already and if true return
  if (grid[row][column]) return;

  // mark the cell as visited
  grid[row][column] = true;

  // Assemble list of neighbours
  // original row=1 col=1 , left row col-1, right row col +1
  // top row-1 col , bottom row + 1 col

  const neighbours = random([
    [row - 1, column, "up"],
    [row + 1, column, "down"],
    [row, column - 1, "left"],
    [row, column + 1, "right"],
  ]);

  // console.log(neighbours);

  // Go over the neighbours
  for (let neighbour of neighbours) {
    // 1. deconstruct the neighbour
    let [nRow, nCol, direction] = neighbour;
    // 2. Check if neigbour is out of bounds (continue meanus return without doing anything to this neigbour)
    if (nRow < 0 || nRow >= cellVertical || nCol < 0 || nCol >= cellHorizontal)
      continue;
    // 3. Check if this neighbour is visited
    // console.log(nRow, nCol);
    if (grid[nRow][nCol]) continue;
    // 4. Remove a horizontal or vertical wall
    // left or rights means a vertical wall will be removed (cell set to true)
    if (direction === "left") verticals[row][column - 1] = true;
    if (direction === "right") verticals[row][column] = true;
    // up or bottom means a horizontal wall will be removed
    if (direction === "up") horizontals[row - 1][column] = true;
    if (direction === "down") horizontals[row][column] = true;

    // Recursion
    // console.log(nRow, nCol);
    stepThroughCells(nRow, nCol);
  }
};
stepThroughCells(startRow, startCol);
// generateMazeWalls(1, 1);

// Render maze on display
horizontals.forEach((row, rowIndex) => {
  row.forEach((open, columnIndex) => {
    if (open) return;
    const bar = Bodies.rectangle(
      unitLengthX / 2 + columnIndex * unitLengthX,
      unitLengthY + rowIndex * unitLengthY,
      unitLengthX,
      10,
      {
        isStatic: true,
        label: "wall",
        render: {
          fillStyle: "#38bdf8",
        },
      }
    );
    World.add(world, bar);
  });
});

verticals.forEach((column, rowIndex) => {
  column.forEach((open, columnIndex) => {
    if (open) return;
    const bar = Bodies.rectangle(
      unitLengthX + columnIndex * unitLengthX,
      unitLengthY / 2 + rowIndex * unitLengthY,
      10,
      unitLengthY,
      {
        isStatic: true,
        label: "wall",
        render: {
          fillStyle: "#38bdf8",
        },
      }
    );
    World.add(world, bar);
  });
  // console.log(column);
});

// Rendering Goal on display
const goal = Bodies.rectangle(
  width - unitLengthX / 2,
  height - unitLengthY / 2,
  0.5 * unitLengthX,
  0.5 * unitLengthY,
  {
    isStatic: true,
    label: "goal",
    render: {
      fillStyle: "#fcd34d",
    },
  }
);
World.add(world, goal);

// Rendering Ball on display
const ball = Bodies.circle(unitLengthX / 2, unitLengthY / 2, ballRadius, {
  label: "ball",
  render: {
    fillStyle: "#ef4444",
  },
});
World.add(world, ball);

// Adding controls
document.addEventListener("keydown", (e) => {
  let { x, y } = ball.velocity;
  if (e.code === "KeyW") Body.setVelocity(ball, { x, y: y - 5 });
  if (e.code === "KeyS") Body.setVelocity(ball, { x, y: y + 5 });
  if (e.code === "KeyA") Body.setVelocity(ball, { x: x - 5, y });
  if (e.code === "KeyD") Body.setVelocity(ball, { x: x + 5, y });
});

// Win condition

Events.on(engine, "collisionStart", (e) => {
  e.pairs.forEach((collision) => {
    // it's not known which body will come first so if you write, if(collision.bodyA==='') the statement will get very long
    const labels = ["ball", "goal"];
    if (
      labels.includes(collision.bodyA.label) &&
      labels.includes(collision.bodyB.label)
    ) {
      console.log("won");
      world.gravity.y = 1;
      world.bodies.forEach((body) => {
        if (body.label === "wall") Body.setStatic(body, false);
        document.querySelector(".winner").classList.remove("hidden");
      });
    }
  });
});
