import React, { useMemo, useState } from "react";

// --- Utility math helpers ---
const deg2rad = (d: number) => (d * Math.PI) / 180;
const rad2deg = (r: number) => (r * 180) / Math.PI;

function polar(mag: number, deg: number) {
  const th = deg2rad(deg);
  return { x: mag * Math.cos(th), y: mag * Math.sin(th) };
}
function add(a: { x: number; y: number }, b: { x: number; y: number }) {
  return { x: a.x + b.x, y: a.y + b.y };
}
function dot(a: { x: number; y: number }, b: { x: number; y: number }) {
  return a.x * b.x + a.y * b.y;
}
function norm(v: { x: number; y: number }) {
  return Math.hypot(v.x, v.y);
}
function unit(v: { x: number; y: number }) {
  const n = norm(v) || 1e-6;
  return { x: v.x / n, y: v.y / n };
}
function scale(v: { x: number; y: number }, s: number) {
  return { x: v.x * s, y: v.y * s };
}

// --- SVG helper components ---
const Arrow = ({
  from,
  to,
  stroke = "currentColor",
  width = 2,
  dashed = false,
  markerId = "arrowhead",
}: {
  from: { x: number; y: number };
  to: { x: number; y: number };
  stroke?: string;
  width?: number;
  dashed?: boolean;
  markerId?: string;
}) => (
  <line
    x1={from.x}
    y1={from.y}
    x2={to.x}
    y2={to.y}
    stroke={stroke}
    strokeWidth={width}
    strokeDasharray={dashed ? "6 6" : undefined}
    markerEnd={`url(#${markerId})`}
  />
);

const Sector = ({
  center,
  r,
  angleDeg,
  halfWidthDeg,
  fill,
  opacity = 0.12,
}: {
  center: { x: number; y: number };
  r: number;
  angleDeg: number;
  halfWidthDeg: number;
  fill: string;
  opacity?: number;
}) => {
  const a0 = deg2rad(angleDeg - halfWidthDeg);
  const a1 = deg2rad(angleDeg + halfWidthDeg);
  const p0 = { x: center.x + r * Math.cos(a0), y: center.y + r * Math.sin(a0) };
  const p1 = { x: center.x + r * Math.cos(a1), y: center.y + r * Math.sin(a1) };
  const largeArc = halfWidthDeg * 2 > 180 ? 1 : 0;
  const d = `M ${center.x} ${center.y} L ${p0.x} ${p0.y} A ${r} ${r} 0 ${largeArc} 1 ${p1.x} ${p1.y} Z`;
  return <path d={d} fill={fill} opacity={opacity} />;
};

// --- Main visualization component ---
export default function SuperpositionConeVisualizer() {
  const W = 720;
  const H = 520;
  const center = { x: W / 2, y: H / 2 };
  const R = 200;

  const [wAngle, setWAngle] = useState(25);
  const [coneHalfDeg, setConeHalfDeg] = useState(30);
  const [f1Angle, setF1Angle] = useState(5);
  const [f2Angle, setF2Angle] = useState(60);
  const [f1On, setF1On] = useState(true);
  const [f2On, setF2On] = useState(true);
  const [showSigned, setShowSigned] = useState(false);

  const wVec = useMemo(() => unit(polar(1, wAngle)), [wAngle]);
  const f1 = useMemo(() => (f1On ? polar(1, f1Angle) : { x: 0, y: 0 }), [f1Angle, f1On]);
  const f2 = useMemo(() => (f2On ? polar(1, f2Angle) : { x: 0, y: 0 }), [f2Angle, f2On]);
  const xSum = useMemo(() => add(f1, f2), [f1, f2]);

  const a1 = dot(wVec, f1);
  const a2 = dot(wVec, f2);
  const aSum = dot(wVec, xSum);

  const relu = (z: number) => (z > 0 ? z : 0);
  const y1 = relu(a1);
  const y2 = relu(a2);
  const ySum = relu(aSum);
  const signed = showSigned ? relu(aSum) - relu(-aSum) : ySum;
  const interference = y1 + y2 - ySum;

  const toSVG = (v: { x: number; y: number }) => ({ x: center.x + v.x * R, y: center.y - v.y * R });
  const origin = center;
  const wTip = toSVG(wVec);
  const f1Tip = toSVG(unit(f1));
  const f2Tip = toSVG(unit(f2));
  const xTip = toSVG(unit(xSum));

  return (
    <div className="p-4 text-white bg-neutral-950">
      <h1 className="text-2xl font-semibold mb-3">Superposition Cone Visualizer</h1>
      <p className="text-neutral-400 mb-4">
        View a neuron's weight vector as an axis ("cone") that multiple sparse feature directions can project onto.
        ReLU acts as nonlinear filtering.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[400px] bg-neutral-900 rounded-lg">
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" />
          </marker>
        </defs>
        <circle cx={center.x} cy={center.y} r={R} stroke="#333" strokeWidth="1" fill="none" />
        <Sector center={center} r={R} angleDeg={wAngle} halfWidthDeg={coneHalfDeg} fill="#22c55e" opacity={0.15} />
        <g style={{ color: "#22c55e" }}>
          <Arrow from={origin} to={wTip} width={3} />
          <text x={wTip.x} y={wTip.y} dx={8} dy={-4} fill="#22c55e">
            w
          </text>
        </g>
        {f1On && (
          <g style={{ color: "#60a5fa" }}>
            <Arrow from={origin} to={f1Tip} width={2} />
            <text x={f1Tip.x} y={f1Tip.y} dx={8} dy={-4} fill="#60a5fa">
              f₁
            </text>
          </g>
        )}
        {f2On && (
          <g style={{ color: "#f472b6" }}>
            <Arrow from={origin} to={f2Tip} width={2} />
            <text x={f2Tip.x} y={f2Tip.y} dx={8} dy={-4} fill="#f472b6">
              f₂
            </text>
          </g>
        )}
        <g style={{ color: "#eab308" }}>
          <Arrow from={origin} to={xTip} width={2} dashed />
          <text x={xTip.x} y={xTip.y} dx={8} dy={-4} fill="#eab308">
            f₁+f₂
          </text>
        </g>
      </svg>

      <div className="mt-4 text-sm space-y-1">
        <p>
          <b>Linear projections:</b> w·f₁={a1.toFixed(3)}, w·f₂={a2.toFixed(3)}, w·(f₁+f₂)={aSum.toFixed(3)}
        </p>
        <p>
          <b>ReLU outputs:</b> {y1.toFixed(3)}, {y2.toFixed(3)}, joint={ySum.toFixed(3)} → interference ={" "}
          {interference.toFixed(3)}
        </p>
        {showSigned && <p>Signed readout (ReLU(w·x)−ReLU(−w·x)) = {signed.toFixed(3)}</p>}
      </div>
    </div>
  );
}
