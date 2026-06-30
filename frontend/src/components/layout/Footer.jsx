import { Link } from "react-router-dom";
import { Activity, Phone, Mail, Github } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-clinical-950 text-clinical-100 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-clinical-600">
                <Activity className="w-4.5 h-4.5" strokeWidth={2.5} />
              </span>
              <span className="font-display text-base font-semibold">
                MediSense<span className="text-vital-400">AI</span>
              </span>
            </div>
            <p className="text-sm text-clinical-300 leading-relaxed">
              An offline-first AI disease prediction system, built to help you understand
              symptoms and find the right next step.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Navigate</h3>
            <ul className="space-y-2 text-sm text-clinical-300">
              <li><Link to="/symptom-checker" className="hover:text-vital-400 transition-colors">Symptom Checker</Link></li>
              <li><Link to="/diseases" className="hover:text-vital-400 transition-colors">Disease Library</Link></li>
              <li><Link to="/history" className="hover:text-vital-400 transition-colors">Prediction History</Link></li>
              <li><Link to="/faq" className="hover:text-vital-400 transition-colors">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Emergency</h3>
            <ul className="space-y-2 text-sm text-clinical-300">
              <li className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> Emergency: 911 (US) / 112 (EU)</li>
              <li className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> Poison Control: 1-800-222-1222</li>
              <li>
                <Link to="/emergency" className="text-vital-400 hover:underline">View full emergency directory →</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Disclaimer</h3>
            <p className="text-xs text-clinical-400 leading-relaxed">
              This system is for informational purposes only and does not provide medical advice,
              diagnosis, or treatment. Always seek the advice of a qualified healthcare provider.
            </p>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-clinical-800 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-clinical-400">
          <p>© {new Date().getFullYear()} MediSense AI — AI Disease Prediction System. Built with free & open-source tools.</p>
          <p>Runs fully offline. No paid APIs required.</p>
        </div>
      </div>
    </footer>
  );
}
