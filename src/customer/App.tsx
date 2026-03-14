/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { 
  Scissors, 
  User, 
  Sparkles, 
  MapPin, 
  Phone, 
  Mail, 
  Instagram, 
  Facebook, 
  Clock,
  ChevronDown,
  ChevronsDown,
  ChevronLeft,
  ChevronRight,
  Star,
  ShieldCheck,
  Gem,
  Menu,
  X
} from "lucide-react";
import { useState, useEffect } from "react";

const LOGO_URL = "/logobarber.png";
const HERO_BG = "https://lh3.googleusercontent.com/aida-public/AB6AXuBUKjhi5EpnzhCsBUrAhA0Xe4GlUx6tAZHeLy8v-ES3Bd_PXd5LRC82N8ikcWShb7qZ1iYrto3SEAeeSqja8dl8duPL3ZgKZuuKC8yR-4oMN2BC-zVCDVexEFLtJbxtNogCA40Z20vZThq86EcQ447jb5dBmNjl2glItacTY5My5lou64l1BzSjABsLP5Bfmr6akUme9VmywjVQANOMo7mplFjFz8xH93QQzah4bAm0XzJ7molWkbdRRYijNca83rHC2kzLFLyjOhA";

interface ServiceItem {
  name: string;
  price: string;
  description: string;
  durationMin?: number;
}

interface ServiceCategory {
  category: string;
  items: ServiceItem[];
}

interface SharedBarber {
  id: string;
  name: string;
  status: "Available" | "Busy" | "Break";
  queueLength: number;
  nextAvailableSlotIso: string | null;
}

interface SharedCatalogResponse {
  services: ServiceCategory[];
  barbers: SharedBarber[];
}

const DEFAULT_SERVICES: ServiceCategory[] = [
  {
    category: "Signature Cuts",
    items: [
      { name: "Mens Haircut", price: "$35", description: "Precision cut tailored to your style and face shape." },
      { name: "Mens Haircut + Beard", price: "$55", description: "Complete grooming: Haircut plus expert beard shaping and line-up." },
      { name: "Student Haircut (10-17)", price: "$30", description: "Professional cut for students aged 10 to 17." },
      { name: "Senior Haircut (65+)", price: "$30", description: "Classic cut for our distinguished seniors." },
      { name: "Kids Haircut (Under 10)", price: "$25", description: "Gentle and stylish cut for the little ones." },
    ]
  },
  {
    category: "Shaves & Beards",
    items: [
      { name: "Head Shave", price: "$35", description: "Old school head shave using a straight razor blade for the smoothest finish." },
      { name: "Head Shave + Beard", price: "$55", description: "Straight razor head shave combined with beard grooming." },
      { name: "Beard Line up", price: "$25", description: "Clean up the edges and maintain your beard's shape." },
      { name: "Beard (Colour)", price: "$35", description: "Professional beard coloring to cover greys or enhance depth." },
      { name: "Hair (Colour)", price: "$45", description: "Full hair color treatment for a fresh new look." },
    ]
  },
  {
    category: "Facial & Treatments",
    items: [
      { name: "Grooms Package", price: "$130", description: "The ultimate wedding-day grooming experience." },
      { name: "Diamond Facial", price: "$75", description: "Premium skin rejuvenation and deep cleansing." },
      { name: "Gold Facial", price: "$55", description: "Luxurious facial treatment for glowing skin." },
      { name: "Black Peel-off Mask", price: "$10", description: "Deep cleansing charcoal mask to clear pores." },
      { name: "Hot Towel (Add On)", price: "$5", description: "Relaxing steam treatment with facial massage." },
      { name: "Threading", price: "$10", description: "Precise hair removal for eyebrows and cheeks." },
    ]
  }
];

const GALLERY = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDalri2HGfs2rqbv1uUyIe0GEakNu24WeAlIsuHzqy3YwzM6P5pQdWS0pJDle35Ldc0iat8xonqOPMYK5p6__K2paBYEeuA7ZBS_SqhcApyAwkot9kiz58gujT5UfdoiL_iTijGoXiITmYgZKWENoIPSb0f-RlmF-va989VC5iGWcnzYWrCSpl82Jq3jCA4vNnnTC1enxZ3KaLKVAn4bIktUtnxi7WgO5FwZvXp_DB78eUDMcietaPVwQFuKjUeFJ3tbVvW2hEV-vc",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDfJjjPE0QDyWq00yRM_rGyqbbDvJf25D-ypIVmvnEJGb_R0bBB3kjsTHSHgUXX-Os6XpkiE4nBhlhtv3Bnr3nclLzwyaTEOrMkCpD2FeSF0ECuYZa31nCsuiKM94Sn5Od7qhIqxALAap_jtOJe_v2S36XoUEiWpUsuiUcCrmgkjpMwSny6UF1gur6-F86bm0VpVdvUqGOx7aB3Jo7LVRPfP3YlIuZOM2WFSlBjq9f8NTq6OK26gEDDdnKpCOUccJnNIyOZ27L1sG0",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCR9PjeTLe01m6jveTnH3tbq3O7nDQdQEuzkKcS7bQHPZqmYaN10oSG_s1IpeGx1659rzZ0ZX5QmZx3xqJhna3Vw1rau-tdCF6of9kIEhphApcrDrXFMxpAKGbQ1XTZxhwV-_Luuc2RAvljfS3OFhGVRj2Z2kZCmLOZ3oHYL6rFyYEvyI5QUnb0xWCefgeDIbelmhJ7rLaNCcPlslzWeoz17jEOSS7gBt9qJ7A0Q1Awdqrje1eY0HQh8-CjYY73Usd-zCVJsj8rnVY",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAEHg3hUdxfVQKqnUDk7Xxmu2M8xgLjdiU6JUlfrdGkN0RKj2Ec6sKGzML2X6z8trEKCj4odwm3F5oDtLo10BY-lxnjS1uEh9fcECgAoWqUpfa2zDLX5_o6vz2ADf3iC3A-HbDx0NHwldm5NCL8wd9UdZ1JpixlRzF_teJqm-ptsG27vZwf3lpXKMd8TlRXib7YZ65VegeN5oQbusLw_tV1HnDCe0Q_1ILKUmkrsNswvNkMo2DSNmd_3Z0rIp4onfWIIE-RZrh137E",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDwIWjXRvPAwbCDU4OAIpNJy-szbDrbcZTGsB3hqowasCQrCKA48M_BZohM-V_6MNEXe7zH6MWZNUjMjCzDZbnBgwtzwMfE40VdxTWRKokM9gi_QEMoMSXZCGTlNtbETfBwrfEp2YoEQ-rhUe0F-pAMpKw52lX1kh56e_obDQsnfahePdCe4m_crZZZnI6HnTv_jNFZjbOLD-zp5fE1UrVFKivH5wD_YxdLZvCfI7kcDjZHRZnFM1HsuKwl9ySKr7PHa3CagN6TKUQ",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDovJDVqm0KPKN4-shgNhERY_WnR3ts2IcN8h8yVKa0TEp4tAbSTFt7w4qDF0hI0vCIlfI9gWZqTIS392_JOE9tda_u5ijP8_LZYXF5OT68tP389jrQu4tZOsCSoWKKTyLioHUzWxtzj6GZQD_MBVNezLrdhp-YFGtWfpERbKStw-8lAmmV7VlPc-va5IR3EQV_-e4fu4AGvehOK_3ICKEQVSriiB5Q-wMWfsILpIyaTdG1VZWwOfYHoo0lEqIMjJPalNtRwy5yWbM",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuC9PegthT9CHhFRYFNeas94dnnQkME23Dh4N_gETWiFmNKInI4J4B68jpBpOk25Xo54Q_Ba94qUGWPBbj_oCQkX3ySjvy1_Ztw8ff5Q69snjh4OdSJdSZjs7xKESzwY7oowtnusluwkcwYQsbKNS3BueiBrSgUpSjv_bkcaMjOjWNcEP3ZIzJZ-pto9eteJbOeK3tE5ju-_miUzJv8LNzNAAaxFh0ep0hwgpxqjIoLwrz62raRJcgs657E6tVCG6r9dOx4UHWGshpU"
];

const LOCATIONS = [
  {
    name: "Oakville",
    address: "150 Oak Park Blvd Unit 5, Oakville, ON L6H 3P2",
    mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2892.457317734267!2d-79.72120668450616!3d43.48504397912554!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x882b43b672782787%3A0x629158320496181!2s150%20Oak%20Park%20Blvd%20Unit%205%2C%20Oakville%2C%20ON%20L6H%203P2!5e0!3m2!1sen!2sca!4v1625687451234!5m2!1sen!2sca"
  },
  {
    name: "Vaughan",
    address: "3175 Rutherford Rd, Vaughan, ON L4K 5Y6",
    mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2876.333333333333!2d-79.53333333333333!3d43.83333333333333!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x882b2f0000000000%3A0x0000000000000000!2sVaughan%2C%20ON!5e0!3m2!1sen!2sca!4v1625687451234!5m2!1sen!2sca"
  }
];

const IMAGES_PER_PAGE = 10;
const MAX_GALLERY_PAGES = 5;

const REVIEWS = [
  {
    author: "James T.",
    rating: 5,
    text: "Best barbershop in the GTA. The atmosphere is top-notch and the attention to detail is unmatched. Sami is a true artist.",
    date: "2 weeks ago"
  },
  {
    author: "Michael R.",
    rating: 5,
    text: "I've been coming here for a year now. Marcus gives the best hot towel shave I've ever had. Highly recommend S.Blends.",
    date: "1 month ago"
  },
  {
    author: "David L.",
    rating: 5,
    text: "Clean, professional, and always on time. The online booking makes it so easy. 5 stars every time.",
    date: "3 days ago"
  }
];

export default function App() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [bookingStep, setBookingStep] = useState(0);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [placeData, setPlaceData] = useState<any>(null);
  const [liveReviews, setLiveReviews] = useState<any[]>(REVIEWS);
  const [liveGallery, setLiveGallery] = useState<string[]>(GALLERY);
  const [serviceCatalog, setServiceCatalog] = useState<ServiceCategory[]>(DEFAULT_SERVICES);
  const [sharedBarbers, setSharedBarbers] = useState<SharedBarber[]>([]);

  const [activeServiceIndex, setActiveServiceIndex] = useState(0);
  const [activeReviewIndex, setActiveReviewIndex] = useState(0);
  const [activeGalleryPageIndex, setActiveGalleryPageIndex] = useState(0);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fetchSharedCatalog = async () => {
    try {
      const response = await fetch("/api/shared/catalog");
      if (!response.ok) return;
      const data = (await response.json()) as SharedCatalogResponse;
      if (Array.isArray(data.services) && data.services.length > 0) {
        setServiceCatalog(data.services);
      }
      if (Array.isArray(data.barbers)) {
        setSharedBarbers(data.barbers);
      }
    } catch (error) {
      console.error("Error fetching shared catalog:", error);
    }
  };

  // Chunk gallery into pages of 10 (newest first), max 5 pages
  const galleryPages = (() => {
    const all = [...liveGallery].slice(0, IMAGES_PER_PAGE * MAX_GALLERY_PAGES);
    const pages: string[][] = [];
    for (let i = 0; i < all.length; i += IMAGES_PER_PAGE) {
      pages.push(all.slice(i, i + IMAGES_PER_PAGE));
    }
    return pages.length ? pages : [[]];
  })();

  useEffect(() => {
    const servicesEl = document.getElementById('services-scroll');
    const reviewsEl = document.getElementById('reviews-scroll');
    const galleryEl = document.getElementById('gallery-scroll');

    const handleServicesScroll = () => {
      if (servicesEl) {
        const index = Math.round(servicesEl.scrollLeft / servicesEl.clientWidth);
        setActiveServiceIndex(index);
      }
    };

    const handleReviewsScroll = () => {
      if (reviewsEl) {
        const index = Math.round(reviewsEl.scrollLeft / reviewsEl.clientWidth);
        setActiveReviewIndex(index);
      }
    };

    const handleGalleryScroll = () => {
      if (galleryEl) {
        const index = Math.round(galleryEl.scrollLeft / galleryEl.clientWidth);
        setActiveGalleryPageIndex(index);
      }
    };

    servicesEl?.addEventListener('scroll', handleServicesScroll);
    reviewsEl?.addEventListener('scroll', handleReviewsScroll);
    galleryEl?.addEventListener('scroll', handleGalleryScroll);

    return () => {
      servicesEl?.removeEventListener('scroll', handleServicesScroll);
      reviewsEl?.removeEventListener('scroll', handleReviewsScroll);
      galleryEl?.removeEventListener('scroll', handleGalleryScroll);
    };
  }, [liveReviews, liveGallery]);

  useEffect(() => {
    setActiveGalleryPageIndex((i) => Math.min(i, galleryPages.length - 1));
  }, [galleryPages.length]);

  useEffect(() => {
    setActiveServiceIndex((i) => Math.min(i, Math.max(serviceCatalog.length - 1, 0)));
  }, [serviceCatalog.length]);

  const scrollToIndex = (id: string, index: number) => {
    const el = document.getElementById(id);
    if (!el) return;
    const items = el.children;
    if (items[index]) {
      (items[index] as HTMLElement).scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'start'
      });
    }
  };

  const fetchPlaceDetails = async () => {
    try {
      const response = await fetch("/api/place-details");
      const data = await response.json();
      setPlaceData(data);
      
      if (data.reviews) {
        const formattedReviews = data.reviews.map((r: any) => ({
          author: r.authorAttribution?.displayName ?? "Anonymous",
          rating: r.rating ?? 5,
          text: r.text?.text ?? "",
          date: r.relativePublishTimeDescription ?? "",
          publishTime: r.publishTime ?? ""
        }));
        // Sort newest first (Google usually returns newest first, but ensure it)
        formattedReviews.sort((a: any, b: any) => 
          (b.publishTime || "").localeCompare(a.publishTime || "")
        );
        setLiveReviews(formattedReviews.slice(0, 10)); // Latest 10 reviews
      }

      if (data.photos) {
        // Newest first - use all photos (API returns up to 10)
        const photoUrls = data.photos.slice(0, IMAGES_PER_PAGE * MAX_GALLERY_PAGES).map((p: any) => `/api/photo/${p.name}`);
        setLiveGallery(photoUrls);
      }
    } catch (error) {
      console.error("Error fetching live data:", error);
    }
  };

  useEffect(() => {
    fetchPlaceDetails();
    fetchSharedCatalog();
    // Live update: refetch every 5 min so new Google reviews/photos appear
    const placeInterval = setInterval(fetchPlaceDetails, 5 * 60 * 1000);
    const sharedInterval = setInterval(fetchSharedCatalog, 30 * 1000);
    return () => {
      clearInterval(placeInterval);
      clearInterval(sharedInterval);
    };
  }, []);

  const scrollTo = (id: string) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const BookingModal = () => (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 ${isBookingOpen ? "visible" : "invisible"}`}>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: isBookingOpen ? 1 : 0 }}
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        onClick={() => setIsBookingOpen(false)}
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: isBookingOpen ? 1 : 1, opacity: isBookingOpen ? 1 : 0 }}
        className="relative bg-noir-light border border-white/10 w-full max-w-2xl p-6 md:p-8 shadow-2xl overflow-y-auto max-h-[90vh] rounded-2xl"
      >
        <button 
          onClick={() => setIsBookingOpen(false)}
          className="absolute top-4 right-4 text-gray-500 hover:text-white"
        >
          ✕
        </button>

        <h2 className="text-3xl font-bold mb-8 gold-gradient-text">Book Appointment</h2>

        {bookingStep === 0 && (
          <div className="space-y-4">
            <h3 className="text-gold uppercase tracking-widest text-sm mb-4">Select a Service</h3>
            {serviceCatalog.flatMap(s => s.items).map(item => (
              <button 
                key={item.name}
                onClick={() => { setSelectedService(item); setBookingStep(2); }}
                className="w-full p-4 border border-white/5 hover:border-gold/50 text-left flex justify-between items-center transition-all group"
              >
                <div>
                  <div className="font-bold group-hover:text-gold transition-colors">{item.name}</div>
                  <div className="text-xs text-gray-500">{item.description}</div>
                </div>
                <div className="text-gold font-bold">{item.price}</div>
              </button>
            ))}
          </div>
        )}

        {bookingStep === 2 && (
          <div className="space-y-6">
            <h3 className="text-gold uppercase tracking-widest text-sm mb-4">Select Time Slot</h3>
            <div className="grid grid-cols-3 gap-3">
              {["10:00 AM", "11:00 AM", "12:30 PM", "2:00 PM", "3:30 PM", "5:00 PM"].map(time => (
                <button 
                  key={time}
                  onClick={() => setBookingStep(3)}
                  className="p-3 border border-white/5 hover:border-gold hover:bg-gold hover:text-noir transition-all text-sm font-bold"
                >
                  {time}
                </button>
              ))}
            </div>
            <button onClick={() => setBookingStep(0)} className="text-xs text-gray-500 hover:text-white mt-4">← Back to Services</button>
          </div>
        )}

        {bookingStep === 3 && (
          <div className="text-center py-10">
            <div className="w-20 h-20 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="text-gold" size={40} />
            </div>
            <h3 className="text-2xl font-bold mb-2">Appointment Confirmed!</h3>
            <p className="text-gray-400 mb-8">
              {selectedService?.name}<br />
              We've sent a confirmation to your email.
            </p>
            <button 
              onClick={() => { setIsBookingOpen(false); setBookingStep(0); }}
              className="px-8 py-3 bg-gold text-noir font-bold uppercase tracking-widest hover:bg-gold-light transition-all"
            >
              Done
            </button>
          </div>
        )}

        <div className="mt-12 pt-8 border-t border-white/5 text-center">
          <p className="text-xs text-gray-500 mb-4 uppercase tracking-widest">Or book via our official partner</p>
          <a 
            href="https://booksy.com/en-ca/8443_s-blends-barbershop_barbershop_773207_oakville?rwg_token=AFd1xnHnpcv8NvTjizmY8rLXieiWGB1AGcJ9eBa9RybiMUXMaYxvZv3fAMXXN5N8BQBkfxwyjNXgvXEN8FRaueTOsthlj1-Udw%3D%3D#ba_s=seo" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-2 border border-[#00A699] text-[#00A699] font-bold rounded hover:bg-[#00A699] hover:text-white transition-all"
          >
            Book on Booksy
          </a>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-noir selection:bg-gold selection:text-noir">
      <BookingModal />

      {/* Mobile Menu Overlay */}
      <motion.div 
        initial={false}
        animate={{ 
          opacity: isMobileMenuOpen ? 1 : 0,
          x: isMobileMenuOpen ? 0 : "100%"
        }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className={`fixed inset-0 bg-noir z-[100] lg:hidden flex flex-col items-center justify-center gap-8 p-6 ${isMobileMenuOpen ? "pointer-events-auto" : "pointer-events-none"}`}
      >
        <button 
          className="absolute top-8 right-8 text-gold p-2"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-label="Close Menu"
        >
          <X size={32} />
        </button>
        {["services", "gallery", "reviews", "locations"].map((item) => (
          <button 
            key={item}
            onClick={() => scrollTo(item)}
            className="text-2xl uppercase tracking-[0.3em] font-bold text-white hover:text-gold transition-colors"
          >
            {item}
          </button>
        ))}
        <a 
          href="https://booksy.com/en-ca/8443_s-blends-barbershop_barbershop_773207_oakville?rwg_token=AFd1xnHnpcv8NvTjizmY8rLXieiWGB1AGcJ9eBa9RybiMUXMaYxvZv3fAMXXN5N8BQBkfxwyjNXgvXEN8FRaueTOsthlj1-Udw%3D%3D#ba_s=seo" 
          target="_blank" 
          rel="noopener noreferrer"
          onClick={() => setIsMobileMenuOpen(false)}
          className="mt-4 bg-gold text-noir w-full py-4 font-bold uppercase tracking-[0.2em] text-sm text-center"
        >
          Book Appointment
        </a>
      </motion.div>
      
      {/* Navbar */}
      <nav className={`fixed w-full z-[80] transition-all duration-500 ${isScrolled ? "bg-noir/95 backdrop-blur-lg py-3 shadow-2xl" : "bg-gradient-to-b from-black/90 to-transparent py-6"}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <a 
            href="https://booksy.com/en-ca/8443_s-blends-barbershop_barbershop_773207_oakville?rwg_token=AFd1xnHnpcv8NvTjizmY8rLXieiWGB1AGcJ9eBa9RybiMUXMaYxvZv3fAMXXN5N8BQBkfxwyjNXgvXEN8FRaueTOsthlj1-Udw%3D%3D#ba_s=seo" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center cursor-pointer relative z-[90]"
          >
            <img src={LOGO_URL} alt="S.Blends Logo" className="h-12 md:h-16 w-auto transition-all duration-300" />
          </a>
          
          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-8">
            {["services", "gallery", "reviews", "locations"].map((item) => (
              <button 
                key={item}
                onClick={() => scrollTo(item)}
                className="text-xs uppercase tracking-[0.2em] font-bold text-gray-300 hover:text-gold transition-all duration-300 relative group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gold transition-all duration-300 group-hover:w-full" />
              </button>
            ))}
            <a 
              href="https://booksy.com/en-ca/8443_s-blends-barbershop_barbershop_773207_oakville?rwg_token=AFd1xnHnpcv8NvTjizmY8rLXieiWGB1AGcJ9eBa9RybiMUXMaYxvZv3fAMXXN5N8BQBkfxwyjNXgvXEN8FRaueTOsthlj1-Udw%3D%3D#ba_s=seo" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-gold text-noir px-8 py-2.5 font-bold uppercase text-[10px] tracking-[0.2em] hover:bg-gold-light transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(212,175,55,0.2)]"
            >
              Book Now
            </a>
          </div>

          {/* Mobile Toggle */}
          <button 
            className="lg:hidden text-gold p-2 relative z-[90]"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-32 md:pt-40">
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/50 to-noir z-10" />
        <img 
          src={HERO_BG} 
          alt="Barbershop Interior" 
          className="absolute inset-0 w-full h-full object-cover grayscale brightness-50 scale-105"
        />
        
        <div className="relative z-20 text-center px-6 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-8xl font-bold mb-10 leading-[0.9] tracking-tighter">
              <span className="block gold-gradient-text">Precision.</span>
              <span className="block text-white">Atmosphere.</span>
              <span className="block gold-gradient-text">Excellence.</span>
            </h1>
            <p className="text-lg md:text-2xl text-gray-400 font-light tracking-wide mb-12 max-w-2xl mx-auto px-4">
              A luxury grooming destination blending traditional barbering with modern skincare.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4">
              <a 
                href="https://booksy.com/en-ca/8443_s-blends-barbershop_barbershop_773207_oakville?rwg_token=AFd1xnHnpcv8NvTjizmY8rLXieiWGB1AGcJ9eBa9RybiMUXMaYxvZv3fAMXXN5N8BQBkfxwyjNXgvXEN8FRaueTOsthlj1-Udw%3D%3D#ba_s=seo" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-10 py-4 bg-gold text-noir font-bold text-lg uppercase tracking-widest hover:bg-gold-light transition-all shadow-[0_0_30px_rgba(212,175,55,0.3)] text-center"
              >
                Secure Appointment
              </a>
              <button 
                onClick={() => scrollTo("gallery")}
                className="w-full sm:w-auto px-10 py-4 border-2 border-white/20 text-white font-bold text-lg uppercase tracking-widest hover:bg-white hover:text-noir transition-all backdrop-blur-md"
              >
                The Lookbook
              </button>
            </div>
          </motion.div>
        </div>

        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 text-gold cursor-pointer"
          onClick={() => scrollTo("services")}
        >
          <ChevronsDown size={40} />
        </motion.div>
      </section>

      {/* Stats Bar */}
      <section className="bg-noir-light border-y border-white/5 py-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 items-center text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-4">
            <div className="flex text-gold">
              {[...Array(5)].map((_, i) => <Star key={i} size={20} fill="currentColor" />)}
            </div>
            <div>
              <span className="font-bold text-xl block">4.9/5 Rating</span>
              <span className="text-xs text-gray-500 uppercase tracking-widest">1,200+ Google Reviews</span>
            </div>
          </div>
          <div className="flex items-center justify-center gap-4 text-gray-400">
            <ShieldCheck className="text-gold" />
            <span className="uppercase text-sm tracking-widest">Licensed Master Barbers</span>
          </div>
          <div className="flex items-center justify-center md:justify-end gap-4 text-gray-400">
            <Gem className="text-gold" />
            <span className="uppercase text-sm tracking-widest">Premium Grooming Products</span>
          </div>
        </div>
        {sharedBarbers.length > 0 && (
          <div className="max-w-7xl mx-auto px-6 mt-10">
            <div className="text-[11px] uppercase tracking-[0.25em] text-gray-500 mb-4 text-center md:text-left">Live Team Availability</div>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              {sharedBarbers.map((barber) => (
                <div key={barber.id} className="border border-white/10 rounded-full px-4 py-2 bg-black/20">
                  <div className="text-sm text-white font-semibold">{barber.name}</div>
                  <div className="text-[11px] uppercase tracking-widest text-gray-400">
                    {barber.status} • Queue {barber.queueLength}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 relative overflow-hidden">
        <div className="marble-overlay absolute inset-0 opacity-5 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <span className="text-gold uppercase tracking-[0.4em] text-sm font-bold mb-4 block">The Menu</span>
            <h2 className="text-4xl md:text-6xl font-bold text-white">Signature Services</h2>
            <div className="w-24 h-1 bg-gold mx-auto mt-8" />
          </div>

          <div className="relative group/scroll">
            <div 
              id="services-scroll"
              className="flex lg:grid lg:grid-cols-3 gap-0 lg:gap-12 overflow-x-auto lg:overflow-x-visible snap-x snap-mandatory pb-8 lg:pb-0 scrollbar-hide"
            >
              {serviceCatalog.map((cat, idx) => (
                <motion.div 
                  key={cat.category}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.2 }}
                  className="min-w-full lg:min-w-0 snap-start snap-always bg-noir-light p-8 border border-white/5 hover:border-gold/30 transition-all group"
                >
                  <h3 className="text-2xl text-gold mb-10 pb-4 border-b border-white/10">{cat.category}</h3>
                  <div className="space-y-10">
                    {cat.items.map((item) => (
                      <div key={item.name} className="group/item">
                        <div className="flex justify-between items-baseline mb-2">
                          <h4 className="text-lg font-bold text-white group-hover/item:text-gold transition-colors">{item.name}</h4>
                          <span className="text-gold font-bold">{item.price}</span>
                        </div>
                        <p className="text-sm text-gray-500 font-light leading-relaxed">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Instagram-style Dots */}
            <div className="lg:hidden flex justify-center gap-2 mt-6">
              {serviceCatalog.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => scrollToIndex('services-scroll', idx)}
                  className={`h-1.5 transition-all duration-300 rounded-full ${
                    activeServiceIndex === idx ? "w-6 bg-gold" : "w-1.5 bg-white/20"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
          
          <div className="mt-20 text-center">
            <a 
              href="https://booksy.com/en-ca/8443_s-blends-barbershop_barbershop_773207_oakville?rwg_token=AFd1xnHnpcv8NvTjizmY8rLXieiWGB1AGcJ9eBa9RybiMUXMaYxvZv3fAMXXN5N8BQBkfxwyjNXgvXEN8FRaueTOsthlj1-Udw%3D%3D#ba_s=seo" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block px-12 py-5 bg-gold text-noir font-bold uppercase tracking-widest hover:bg-gold-light transition-all shadow-xl"
            >
              Book Your Transformation
            </a>
          </div>
        </div>
      </section>

      {/* Gallery Section - 10 images per page, paginated with scrollable dots */}
      <section id="gallery" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <span className="text-gold uppercase tracking-[0.4em] text-sm font-bold mb-4 block">The Lookbook</span>
            <h2 className="text-4xl md:text-6xl font-bold text-white">Our Craft</h2>
          </div>

          <div className="relative group/scroll">
            <div 
              id="gallery-scroll"
              className="flex overflow-x-auto snap-x snap-mandatory pb-8 scrollbar-hide"
            >
              {galleryPages.map((pageImages, pageIdx) => (
                <div
                  key={pageIdx}
                  className="min-w-full snap-start snap-always px-2"
                >
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 auto-rows-[180px] md:auto-rows-[220px]">
                    {pageImages.map((img, idx) => (
                      <motion.div 
                        key={`${pageIdx}-${idx}`}
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.05 }}
                        className="relative group overflow-hidden col-span-1 row-span-1"
                      >
                        <img 
                          src={img} 
                          alt={`Gallery ${pageIdx * IMAGES_PER_PAGE + idx + 1}`} 
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination dots - same style as services */}
            {galleryPages.length > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                {galleryPages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => scrollToIndex('gallery-scroll', idx)}
                    className={`h-1.5 transition-all duration-300 rounded-full ${
                      activeGalleryPageIndex === idx ? "w-6 bg-gold" : "w-1.5 bg-white/20"
                    }`}
                    aria-label={`Go to gallery page ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section id="reviews" className="py-24 bg-noir-light relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <span className="text-gold uppercase tracking-[0.4em] text-sm font-bold mb-4 block">Testimonials</span>
            <h2 className="text-4xl md:text-6xl font-bold text-white">Client Voices</h2>
          </div>

          <div className="relative group/scroll">
            <div 
              id="reviews-scroll"
              className="flex md:grid md:grid-cols-3 gap-0 md:gap-8 overflow-x-auto md:overflow-x-visible snap-x snap-mandatory pb-8 md:pb-0 scrollbar-hide"
            >
              {liveReviews.map((review, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.2 }}
                  className="min-w-full md:min-w-0 snap-start snap-always p-8 border border-white/5 bg-noir"
                >
                  <div className="flex text-gold mb-4">
                    {[...Array(review.rating)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                  </div>
                  <p className="text-gray-300 italic mb-6 font-light leading-relaxed">"{review.text}"</p>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white">{review.author}</span>
                    <span className="text-[10px] text-gray-600 uppercase tracking-widest">{review.date}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination dots - mobile only (desktop uses grid) */}
            <div className="md:hidden flex justify-center gap-2 mt-6">
              {liveReviews.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => scrollToIndex('reviews-scroll', idx)}
                  className={`h-1.5 transition-all duration-300 rounded-full ${
                    activeReviewIndex === idx ? "w-6 bg-gold" : "w-1.5 bg-white/20"
                  }`}
                  aria-label={`Go to review ${idx + 1}`}
                />
              ))}
            </div>
          </div>
          <div className="mt-12 text-center text-gray-500 text-xs uppercase tracking-widest">
            Verified Reviews from Google Business Profile
          </div>
        </div>
      </section>

      {/* Locations Section */}
      <section id="locations" className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <span className="text-gold uppercase tracking-[0.4em] text-sm font-bold mb-4 block">Visit Us</span>
            <h2 className="text-4xl md:text-6xl font-bold text-white">The Destinations</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {LOCATIONS.map((loc) => (
              <div key={loc.name} className="bg-noir-light border border-white/5 overflow-hidden group">
                <div className="h-80 w-full grayscale contrast-125 group-hover:grayscale-0 transition-all duration-700">
                  <iframe 
                    src={loc.mapUrl} 
                    width="100%" 
                    height="100%" 
                    className="border-0 filter-[invert(90%)_hue-rotate(180deg)_brightness(0.8)]"
                    title={`${loc.name} location map`}
                    allowFullScreen 
                    loading="lazy"
                  />
                </div>
                <div className="p-10">
                  <h3 className="text-3xl font-bold text-white mb-4">{loc.name}</h3>
                  <div className="flex items-start gap-4 text-gray-400 mb-6">
                    <MapPin className="text-gold shrink-0" />
                    <p className="font-light">{loc.address}</p>
                  </div>
                  <div className="flex flex-wrap gap-6">
                    <button className="flex items-center gap-2 text-gold font-bold uppercase text-xs tracking-widest hover:text-gold-light transition-colors">
                      <Phone size={16} /> Get Directions
                    </button>
                    <button className="flex items-center gap-2 text-gold font-bold uppercase text-xs tracking-widest hover:text-gold-light transition-colors">
                      <Clock size={16} /> View Hours
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-noir-light border-t border-white/5 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-1 md:col-span-1 flex flex-col items-center md:items-start text-center md:text-left">
              <a 
                href="https://booksy.com/en-ca/8443_s-blends-barbershop_barbershop_773207_oakville?rwg_token=AFd1xnHnpcv8NvTjizmY8rLXieiWGB1AGcJ9eBa9RybiMUXMaYxvZv3fAMXXN5N8BQBkfxwyjNXgvXEN8FRaueTOsthlj1-Udw%3D%3D#ba_s=seo" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center mb-8"
              >
                <img src={LOGO_URL} alt="S.Blends Logo" className="h-24 w-auto" />
              </a>
              <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-xs">
                Elevating the standard of male grooming. Where precision meets luxury in a noir atmosphere.
              </p>
              <div className="mb-8">
                <a 
                  href="https://booksy.com/en-ca/8443_s-blends-barbershop_barbershop_773207_oakville?rwg_token=AFd1xnHnpcv8NvTjizmY8rLXieiWGB1AGcJ9eBa9RybiMUXMaYxvZv3fAMXXN5N8BQBkfxwyjNXgvXEN8FRaueTOsthlj1-Udw%3D%3D#ba_s=seo" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 border border-[#00A699] text-[#00A699] text-xs font-bold rounded hover:bg-[#00A699] hover:text-white transition-all uppercase tracking-widest"
                >
                  Book on Booksy
                </a>
              </div>
              <div className="flex gap-4">
                <a href="#" title="Instagram" aria-label="Instagram" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-gray-400 hover:text-gold hover:border-gold transition-all">
                  <Instagram size={18} />
                </a>
                <a href="#" title="Facebook" aria-label="Facebook" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-gray-400 hover:text-gold hover:border-gold transition-all">
                  <Facebook size={18} />
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-gold font-bold uppercase tracking-widest text-sm mb-8">Explore</h4>
              <ul className="space-y-4 text-sm text-gray-500">
                {["Services", "The Experience", "Gallery", "Products", "Careers"].map(item => (
                  <li key={item}><a href="#" className="hover:text-white transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-gold font-bold uppercase tracking-widest text-sm mb-8">Contact</h4>
              <ul className="space-y-6 text-sm text-gray-500">
                <li className="flex items-start gap-3">
                  <MapPin size={18} className="text-gold shrink-0" />
                  <span>150 Oak Park Blvd Unit 5,<br />Oakville, ON L6H 3P2</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone size={18} className="text-gold shrink-0" />
                  <span>(289) 725-6333</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail size={18} className="text-gold shrink-0" />
                  <span>info@sblends.com</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-gold font-bold uppercase tracking-widest text-sm mb-8">Hours</h4>
              <ul className="space-y-4 text-sm text-gray-500">
                <li className="flex justify-between">
                  <span>Mon - Wed</span>
                  <span className="text-white">10am - 8pm</span>
                </li>
                <li className="flex justify-between">
                  <span>Thu - Fri</span>
                  <span className="text-white">9am - 9pm</span>
                </li>
                <li className="flex justify-between">
                  <span>Saturday</span>
                  <span className="text-white">9am - 6pm</span>
                </li>
                <li className="flex justify-between">
                  <span>Sunday</span>
                  <span className="text-white">Closed</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/5 pt-10 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] uppercase tracking-[0.2em] text-gray-600">
            <p>© 2026 S.Blends Barbershop. All rights reserved.</p>
            <div className="flex flex-wrap justify-center gap-8">
              <a href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="/cookie-policy" className="hover:text-white transition-colors">Cookie Policy</a>
              <a href="/email-sms-compliance" className="hover:text-white transition-colors">Email &amp; SMS Compliance</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
