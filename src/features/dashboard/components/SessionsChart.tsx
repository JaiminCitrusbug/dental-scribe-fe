const MONTHS = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']

const COMPLETED = 'M40,150 L100,130 L160,160 L220,110 L280,120 L340,90 L400,70 L460,105 L520,85 L580,120 L640,95 L700,80'
const AREA = `${COMPLETED} L700,200 L40,200 Z`
const REPORTS = 'M40,168 L100,158 L160,175 L220,150 L280,150 L340,132 L400,120 L460,140 L520,128 L580,150 L640,132 L700,122'

/** Static SVG trend chart (no chart lib). Solid translucent area fill - no gradient. */
export function SessionsChart() {
  return (
    <div className="relative">
      <div className="absolute left-[52%] top-6 whitespace-nowrap rounded-[7px] bg-sidebar px-2.5 py-1.5 text-[11.5px] font-semibold text-white shadow-pop">
        46 sessions · Jun
      </div>
      <svg
        viewBox="0 0 720 240"
        preserveAspectRatio="none"
        role="img"
        aria-label="Completed scribe sessions over the last 12 months"
        className="block h-auto w-full"
      >
        <g stroke="#EEF1F5" strokeWidth={1}>
          {[20, 70, 120, 170, 200].map((y) => (
            <line key={y} x1={40} y1={y} x2={710} y2={y} />
          ))}
        </g>
        <g fill="#98A2B3" fontSize={11} fontFamily="Inter Variable, sans-serif">
          <text x={12} y={24}>50</text>
          <text x={12} y={74}>40</text>
          <text x={12} y={124}>30</text>
          <text x={12} y={174}>20</text>
          <text x={20} y={204}>0</text>
        </g>
        <path d={AREA} fill="#2563EB" fillOpacity={0.08} />
        <path d={COMPLETED} fill="none" stroke="#2563EB" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        <path d={REPORTS} fill="none" stroke="#C9D6EA" strokeWidth={2} strokeDasharray="5 5" strokeLinecap="round" />
        <circle cx={400} cy={70} r={5} fill="#fff" stroke="#2563EB" strokeWidth={3} />
        <g fill="#98A2B3" fontSize={11} fontFamily="Inter Variable, sans-serif" textAnchor="middle">
          {MONTHS.map((m, i) => (
            <text key={m} x={40 + i * 60} y={224}>{m}</text>
          ))}
        </g>
      </svg>
    </div>
  )
}
