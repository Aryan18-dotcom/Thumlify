import {
  GithubIcon,
  LinkedinIcon,
  InstagramIcon,
  GlobeIcon,
  RocketIcon,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="relative mt-40 border-t border-white/10 bg-black/60 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-6 py-16">

        {/* Main Grid */}
        <div className="grid gap-12 md:grid-cols-5">

          {/* Brand */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <img src="/favicon.svg" className="size-8" alt="Thumlify" />
              <span className="text-xl font-semibold text-white">
                Thumlify
              </span>
            </div>

            <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
              AI-powered agent that creates
              <span className="text-pink-500 font-medium">
                {" "}high-CTR YouTube thumbnails{" "}
              </span>
              using smart templates and creator-selected styles.
            </p>

            <p className="text-sm text-gray-400">
              Built for creators who want more clicks, more views, and faster growth<RocketIcon className="inline size-4 mb-0.5 ml-1 text-pink-500" /> .
            </p>

            {/* Social */}
            <div className="flex gap-4 pt-2">
              <a href="https://ac-portfolio-phi.vercel.app" target="_blank">
                <GlobeIcon className="size-5 hover:text-pink-500 transition" />
              </a>
              <a href="https://github.com/Aryan18-dotcom" target="_blank">
                <GithubIcon className="size-5 hover:text-pink-500 transition" />
              </a>
              <a href="https://in.linkedin.com/in/aryan-chheda-19ab54363" target="_blank">
                <LinkedinIcon className="size-5 hover:text-pink-500 transition" />
              </a>
              <a href="https://www.instagram.com/aryan_chheda7" target="_blank">
                <InstagramIcon className="size-5 hover:text-pink-500 transition" />
              </a>
            </div>
          </div>

          {/* Pages */}
          <div>
            <p className="footer-title">Pages</p>
            <ul className="footer-list">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/generate">Generate</Link></li>
              <li><Link to="/my-generations">My Generations</Link></li>
              <li><Link to="/community">Community</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className="footer-title">Company</p>
            <ul className="footer-list">
              <li><Link to="/about-creator">About Creator</Link></li>
              <li><Link to="#contact">Contact Us</Link></li>
              <li><a href="#pricing">Pricing</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="footer-title">Legal</p>
            <ul className="footer-list">
              <li><Link to="/privacy-policy">Privacy Policy</Link></li>
              <li><Link to="/terms-of-service">Terms of Service</Link></li>
              <li><Link to="/refund-policy">Refund Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-white/10 pt-6 text-sm text-gray-500">
          <p>
            © {new Date().getFullYear()} Thumlify. Built by{" "}
            <a
              href="https://ac-portfolio-phi.vercel.app"
              target="_blank"
              className="text-pink-500 hover:underline"
            >
              @AryanChheda
            </a>
          </p>

          <p className="text-xs">
            Designed for creators • Powered by AI
          </p>
        </div>
      </div>
    </footer>
  );
}
