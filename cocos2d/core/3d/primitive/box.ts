'use strict';

import Vec3 from '../../value-types/vec3';
import VertexData from './vertex-data';

let temp1 = new Vec3();
let temp2 = new Vec3();
let temp3 = new Vec3();
let r = new Vec3();
let c0 = new Vec3();
let c1 = new Vec3();
let c2 = new Vec3();
let c3 = new Vec3();
let c4 = new Vec3();
let c5 = new Vec3();
let c6 = new Vec3();
let c7 = new Vec3();

/**
 * @param {Number} width
 * @param {Number} height
 * @param {Number} length
 * @param {Object} opts
 * @param {Number} opts.widthSegments
 * @param {Number} opts.heightSegments
 * @param {Number} opts.lengthSegments
 */
export default function (width = 1, height = 1, length = 1, opts = {widthSegments: 1, heightSegments: 1, lengthSegments: 1, invWinding: false}) {
  let ws = opts.widthSegments;
  let hs = opts.heightSegments;
  let ls = opts.lengthSegments;
  let inv = opts.invWinding;

  let hw = width * 0.5;
  let hh = height * 0.5;
  let hl = length * 0.5;

  let corners = [
    Vec3.set(c0, -hw, -hh,  hl),
    Vec3.set(c1,  hw, -hh,  hl),
    Vec3.set(c2,  hw,  hh,  hl),
    Vec3.set(c3, -hw,  hh,  hl),
    Vec3.set(c4,  hw, -hh, -hl),
    Vec3.set(c5, -hw, -hh, -hl),
    Vec3.set(c6, -hw,  hh, -hl),
    Vec3.set(c7,  hw,  hh, -hl),
  ];

  let faceAxes = [
    [ 2, 3, 1 ], // FRONT
    [ 4, 5, 7 ], // BACK
    [ 7, 6, 2 ], // TOP
    [ 1, 0, 4 ], // BOTTOM
    [ 1, 4, 2 ], // RIGHT
    [ 5, 0, 6 ]  // LEFT
  ];

  let faceNormals = [
    [  0,  0,  1 ], // FRONT
    [  0,  0, -1 ], // BACK
    [  0,  1,  0 ], // TOP
    [  0, -1,  0 ], // BOTTOM
    [  1,  0,  0 ], // RIGHT
    [ -1,  0,  0 ]  // LEFT
  ];

  let positions: number[] = [];
  let normals: number[] = [];
  let uvs: number[] = [];
  let indices: number[] = [];
  let minPos = new Vec3(-hw, -hh, -hl);
  let maxPos = new Vec3(hw, hh, hl);
  let boundingRadius = Math.sqrt(hw * hw + hh * hh + hl * hl);

  function _buildPlane (side, uSegments, vSegments) {
    let u, v;
    let ix, iy;
    let offset = positions.length / 3;
    let faceAxe = faceAxes[side];
    let faceNormal = faceNormals[side];

    for (iy = 0; iy <= vSegments; iy++) {
      for (ix = 0; ix <= uSegments; ix++) {
        u = ix / uSegments;
        v = iy / vSegments;

        Vec3.lerp(temp1, corners[faceAxe[0]], corners[faceAxe[1]], u);
        Vec3.lerp(temp2, corners[faceAxe[0]], corners[faceAxe[2]], v);
        Vec3.subtract(temp3, temp2, corners[faceAxe[0]]);
        Vec3.add(r, temp1, temp3);

        positions.push(r.x, r.y, r.z);
        normals.push(faceNormal[0], faceNormal[1], faceNormal[2]);
        uvs.push(u, v);

        if ((ix < uSegments) && (iy < vSegments)) {
          let useg1 = uSegments + 1;
          let a = ix + iy * useg1;
          let b = ix + (iy + 1) * useg1;
          let c = (ix + 1) + (iy + 1) * useg1;
          let d = (ix + 1) + iy * useg1;

          if (inv) {
            indices.push(offset + a, offset + b, offset + d);
            indices.push(offset + d, offset + b, offset + c);
          } else {
            indices.push(offset + a, offset + d, offset + b);
            indices.push(offset + b, offset + d, offset + c);
          }
        }
      }
    }
  }

  _buildPlane(0, ws, hs); // FRONT
  _buildPlane(4, ls, hs); // RIGHT
  _buildPlane(1, ws, hs); // BACK
  _buildPlane(5, ls, hs); // LEFT
  _buildPlane(3, ws, ls); // BOTTOM
  _buildPlane(2, ws, ls); // TOP

  return new VertexData(
    positions,
    normals,
    uvs,
    indices,
    minPos,
    maxPos,
    boundingRadius
  );
}
