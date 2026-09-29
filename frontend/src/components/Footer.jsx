import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Compass, ExternalLink, Globe2 } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-auto">
      {/* Workflow Banner */}
      <div className="bg-slate-950/80 border-b border-slate-800/80 py-4 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-cyan-400 font-semibold tracking-wider uppercase text-[11px]">Core Polaris Pipeline:</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 text-slate-300 text-[11px] font-medium">
            <span className="bg-slate-800/90 text-cyan-300 px-2 py-0.5 rounded border border-slate-700">DISCOVER</span>
            <span className="text-slate-600">→</span>
            <span className="bg-slate-800/90 text-blue-300 px-2 py-0.5 rounded border border-slate-700">CONNECT</span>
            <span className="text-slate-600">→</span>
            <span className="bg-slate-800/90 text-sky-300 px-2 py-0.5 rounded border border-slate-700">UNDERSTAND</span>
            <span className="text-slate-600">→</span>
            <span className="bg-slate-800/90 text-purple-300 px-2 py-0.5 rounded border border-slate-700">CREATE</span>
            <span className="text-slate-600">→</span>
            <span className="bg-slate-800/90 text-emerald-300 px-2 py-0.5 rounded border border-slate-700">VERIFY</span>
            <span className="text-slate-600">→</span>
            <span className="bg-slate-800/90 text-amber-300 px-2 py-0.5 rounded border border-slate-700">DISSEMINATE</span>
          </div>
          <div className="text-[11px] text-slate-400 italic">
            "From Polar Research to Public Understanding."
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: System Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-100 font-bold text-base">
              <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-white text-xs">
                ★
              </div>
              <span>POLARIS</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Polar Knowledge & Outreach Intelligence System built for India's polar science ecosystem, connecting stations, expeditions, datasets, and human-verified outreach.
            </p>
            <div className="pt-2 text-[11px] text-slate-500">
              <div>Smart India Hackathon (SIH 2026)</div>
              <div>Problem Statement: SIH26063</div>
              <div>Theme: Smart Education</div>
            </div>
          </div>

          {/* Col 2: Exploration */}
          <div className="space-y-2">
            <h4 className="text-slate-200 font-semibold uppercase text-[11px] tracking-wider">Scientific Exploration</h4>
            <ul className="space-y-1.5 text-xs">
              <li><Link to="/explore" className="hover:text-cyan-400 transition-colors">Unified Knowledge Repository</Link></li>
              <li><Link to="/map" className="hover:text-cyan-400 transition-colors">Polar Explorer Map</Link></li>
              <li><Link to="/stations/maitri" className="hover:text-cyan-400 transition-colors">Maitri Station (Antarctica)</Link></li>
              <li><Link to="/stations/bharati" className="hover:text-cyan-400 transition-colors">Bharati Station (Antarctica)</Link></li>
              <li><Link to="/stations/himadri" className="hover:text-cyan-400 transition-colors">Himadri Station (Arctic)</Link></li>
              <li><Link to="/stations/himansh" className="hover:text-cyan-400 transition-colors">Himansh Station (Himalaya)</Link></li>
            </ul>
          </div>

          {/* Col 3: Research & Dissemination */}
          <div className="space-y-2">
            <h4 className="text-slate-200 font-semibold uppercase text-[11px] tracking-wider">Knowledge & Outreach</h4>
            <ul className="space-y-1.5 text-xs">
              <li><Link to="/expeditions" className="hover:text-cyan-400 transition-colors">Scientific Expeditions</Link></li>
              <li><Link to="/research" className="hover:text-cyan-400 transition-colors">Research Projects</Link></li>
              <li><Link to="/datasets" className="hover:text-cyan-400 transition-colors">NPDC Polar Datasets</Link></li>
              <li><Link to="/publications" className="hover:text-cyan-400 transition-colors">Peer-Reviewed Publications</Link></li>
              <li><Link to="/learn" className="hover:text-cyan-400 transition-colors">Student Learning Hub</Link></li>
              <li><Link to="/media-studio" className="hover:text-cyan-400 transition-colors">AI Media Studio & Human Review</Link></li>
            </ul>
          </div>

          {/* Col 4: Institutional Links */}
          <div className="space-y-2">
            <h4 className="text-slate-200 font-semibold uppercase text-[11px] tracking-wider">Official Portals</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://ncpor.res.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors"
                >
                  <span>NCPOR Official Portal</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://npdc.ncpor.res.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors"
                >
                  <span>National Polar Data Centre (NPDC)</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://moes.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors"
                >
                  <span>Ministry of Earth Sciences (MoES)</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://ats.aq"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors"
                >
                  <span>Antarctic Treaty Secretariat</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright and disclaimer */}
        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} POLARIS • Ministry of Earth Sciences, Govt. of India. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Official Source Grounded Metadata
            </span>
            <span>•</span>
            <Link to="/outreach" className="hover:text-slate-300">Public Dissemination Portal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
