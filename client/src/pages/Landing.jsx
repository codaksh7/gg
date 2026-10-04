import { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, DollarSign, Briefcase, ArrowRight, CheckCircle2, Zap, Shield, Search, ChevronRight } from 'lucide-react';
import anime from 'animejs';

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const cardsRef = useRef(null);
  
  useEffect(() => {
    // Hero animations
    anime({
      targets: '.landing-hero-bg .orb',
      scale: [0.9, 1.1],
      opacity: [0.1, 0.2],
      direction: 'alternate',
      loop: true,
      duration: 4000,
      easing: 'easeInOutSine',
      delay: anime.stagger(1000)
    });
    
    anime({
      targets: titleRef.current,
      translateY: [30, 0],
      opacity: [0, 1],
      duration: 1000,
      easing: 'easeOutExpo'
    });
    
    anime({
      targets: subtitleRef.current,
      translateY: [20, 0],
      opacity: [0, 1],
      duration: 1000,
      delay: 200,
      easing: 'easeOutExpo'
    });
    
    anime({
      targets: '.landing-cta-group',
      translateY: [20, 0],
      opacity: [0, 1],
      duration: 1000,
      delay: 400,
      easing: 'easeOutExpo'
    });
    
    // Stagger project cards
    anime({
      targets: '.project-card',
      translateY: [40, 0],
      opacity: [0, 1],
      duration: 800,
      delay: anime.stagger(150, {start: 600}),
      easing: 'easeOutElastic(1, .8)'
    });
  }, []);

  const handleProjectClick = (path) => {
    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(path)}`);
    } else {
      navigate(path);
    }
  };

  return (
    <div className="page-enter">
      {/* Hero Section */}
      <section className="landing-hero">
        <div className="landing-hero-bg">
          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>
          <div className="orb orb-3"></div>
        </div>
        
        <div className="landing-hero-content container">
          <h1 ref={titleRef}>
            Your Complete Study Abroad <br />
            <span className="highlight">Toolkit in One Place</span>
          </h1>
          <p ref={subtitleRef}>
            From finding the perfect course and securing education loans to landing your dream job abroad. GradGuide equips you with powerful tools for every step of your international journey.
          </p>
          
          <div className="landing-cta-group">
            {!user ? (
              <>
                <Link to="/register" className="btn btn-primary btn-lg">
                  Get Started Free <ArrowRight size={18} />
                </Link>
                <a href="#projects" className="btn btn-secondary btn-lg">
                  Explore Tools
                </a>
              </>
            ) : (
              <a href="#projects" className="btn btn-primary btn-lg">
                Go to Dashboard <ArrowRight size={18} />
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="landing-projects">
        <div className="container">
          <div className="landing-projects-header">
            <h2>Three Powerful Assistants</h2>
            <p>We've built specialized tools tailored to solve the biggest challenges international students face.</p>
          </div>
          
          <div className="project-cards" ref={cardsRef}>
            {/* Course Recommendation */}
            <div className="project-card course" onClick={() => handleProjectClick('/courses')}>
              <div className="project-card-icon">
                <BookOpen size={28} />
              </div>
              <h3>Course Recommendation</h3>
              <p>
                Smart course matching based on your academic profile, budget, and career goals with detailed relevance explanations.
              </p>
              <ul className="project-card-features">
                <li><CheckCircle2 size={16} className="text-orange-500" /> Advanced matching algorithm</li>
                <li><CheckCircle2 size={16} className="text-orange-500" /> Interactive counselling session notes</li>
                <li><CheckCircle2 size={16} className="text-orange-500" /> Multi-course comparison matrix</li>
              </ul>
              <button className="btn btn-course">
                Launch Tool <ChevronRight size={16} />
              </button>
            </div>
            
            {/* Loan Assessment */}
            <div className="project-card loan" onClick={() => handleProjectClick('/loans')}>
              <div className="project-card-icon">
                <DollarSign size={28} />
              </div>
              <h3>Education Loan Assessment</h3>
              <p>
                Understand your financial position, calculate funding gaps, and discover eligible lenders based on your unique profile.
              </p>
              <ul className="project-card-features">
                <li><CheckCircle2 size={16} className="text-emerald-500" /> Automated eligibility engine</li>
                <li><CheckCircle2 size={16} className="text-emerald-500" /> Collateral & non-collateral analysis</li>
                <li><CheckCircle2 size={16} className="text-emerald-500" /> Smart document checklist generator</li>
              </ul>
              <button className="btn btn-loan">
                Launch Tool <ChevronRight size={16} />
              </button>
            </div>
            
            {/* Job Discovery */}
            <div className="project-card job" onClick={() => handleProjectClick('/jobs')}>
              <div className="project-card-icon">
                <Briefcase size={28} />
              </div>
              <h3>Job Discovery Tool</h3>
              <p>
                Find part-time, full-time, and internship roles tailored for international students using our custom scraping engine.
              </p>
              <ul className="project-card-features">
                <li><CheckCircle2 size={16} className="text-yellow-500" /> Real-time custom web scraper</li>
                <li><CheckCircle2 size={16} className="text-yellow-500" /> Application tracking system</li>
                <li><CheckCircle2 size={16} className="text-yellow-500" /> Student-focused job categories</li>
              </ul>
              <button className="btn btn-job">
                Launch Tool <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats / Why Us */}
      <section className="landing-stats">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <Zap size={32} className="mx-auto mb-4 text-purple-400" />
              <div className="stat-value">3</div>
              <div className="stat-label">Core Tools</div>
            </div>
            <div className="stat-card">
              <BookOpen size={32} className="mx-auto mb-4 text-orange-400" />
              <div className="stat-value">50+</div>
              <div className="stat-label">Curated Courses</div>
            </div>
            <div className="stat-card">
              <Shield size={32} className="mx-auto mb-4 text-emerald-400" />
              <div className="stat-value">100%</div>
              <div className="stat-label">Data Privacy</div>
            </div>
            <div className="stat-card">
              <Search size={32} className="mx-auto mb-4 text-yellow-400" />
              <div className="stat-value">Real</div>
              <div className="stat-label">Scraped Jobs</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container">
          <p>© 2026 GradGuide Assignment. Built for hiring assessment.</p>
        </div>
      </footer>
    </div>
  );
}
