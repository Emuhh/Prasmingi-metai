import { Award } from 'lucide-react'

export default function SavanoriasPasiekimai() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-slate-800">Pasiekimai</h1>
        <p className="text-slate-500 mt-1">Tavo ženkleliai ir apdovanojimai</p>
      </div>

      <div className="card text-center py-16">
        <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center text-brand-600 mx-auto mb-4">
          <Award size={28} />
        </div>
        <h2 className="font-display font-semibold text-lg text-slate-700 mb-1">Netrukus</h2>
        <p className="text-slate-400 text-sm max-w-sm mx-auto">
          Čia netrukus atsiras ženkleliai už savanorystes, valandas ir aktyvumą.
        </p>
      </div>
    </div>
  )
}