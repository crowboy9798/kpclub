import { Mail, Phone, MapPin, Users } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Club Info */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center">
                <img src="/lovable-uploads/a6d3b80c-ee71-454e-989a-d2fd3a8a98ef.png" alt="Probus Logo" className="w-10 h-10 rounded-full" />
              </div>
              <h3 className="text-lg font-semibold">Kensington Probus Club</h3>
            </div>
            <p className="text-primary-foreground/80 leading-relaxed">
              A friendly community club dedicated to fostering fellowship, friendship, and fun through 
              regular meetings, social activities, and shared interests.
            </p>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-secondary" />
                <span className="text-primary-foreground/80">kensingtonprobusclub@gmail.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-secondary" />
                <span className="text-primary-foreground/80">0417803220</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-secondary" />
                <span className="text-primary-foreground/80">St Matthews church, 146 Kensington Road Marryatville SA 5069</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="/membership" className="text-primary-foreground/80 hover:text-secondary transition-smooth">
                  Become a Member
                </a>
              </li>
              <li>
                <a href="/events" className="text-primary-foreground/80 hover:text-secondary transition-smooth">
                  Upcoming Events
                </a>
              </li>
              <li>
                <a href="/contact" className="text-primary-foreground/80 hover:text-secondary transition-smooth">
                  Get in Touch
                </a>
              </li>
              <li>
                <a href="/admin" className="text-primary-foreground/80 hover:text-secondary transition-smooth">
                  Admin
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-glow/20 mt-8 pt-8 text-center">
          <p className="text-primary-foreground/60">
            © 2024 Kensington Probus Club. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;