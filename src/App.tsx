
import { useState, useEffect } from 'react';
import { auth } from './firebase';
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut, User } from 'firebase/auth';
import MainApp from './MainApp';
import { AlpenblickLogo } from './components/AlpenblickLogo';
import { HeartIcon } from './components/icons';

// Configuration duplicated from MainApp for consistency
const APP_CONFIG = {
    logoUrl: "https://alpenblick.net/media/AB_Logo_Kreativeagentur_rn.svg",
    footerLinkText: "Alpenblick",
    footerLink: "https://alpenblick.net/",
    footerTemplate: "Renamer | Mit {{heart}} von {{link}} entwickelt. © 2024"
};

const App = () => {
    // --- DEVELOPMENT SHORTCUT ---
    // In dev mode, we simulate a logged-in and authorized user to bypass the login screen.
    // `import.meta.env.DEV` is a Vite feature that is true during development and false in production builds.
    const [user, setUser] = useState<User | null>(import.meta.env.DEV ? ({} as User) : null);
    const [loading, setLoading] = useState(import.meta.env.DEV ? false : true);
    const [isAuthorized, setIsAuthorized] = useState(import.meta.env.DEV ? true : false);


    useEffect(() => {
        // If we are in development mode, we don't need to check for auth status.
        if (import.meta.env.DEV) {
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                if (currentUser.email && currentUser.email.endsWith('@alpenblick.gmbh')) {
                    setIsAuthorized(true);
                } else {
                    setIsAuthorized(false);
                }
            } else {
                setUser(null);
                setIsAuthorized(false);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const signInWithGoogle = () => {
        const provider = new GoogleAuthProvider();
        signInWithPopup(auth, provider)
            .catch((error) => {
                console.error("Authentication Error Code:", error.code);
                console.error("Authentication Error Message:", error.message);
                
                if (error.code === 'auth/unauthorized-domain') {
                    alert(
                        'Fehler: Diese Domain ist nicht für die Authentifizierung autorisiert.\\n\\n' +
                        'Bitte fügen Sie die URL Ihrer App (z.B. Ihr-Projekt-Name.web.app) zur Liste der autorisierten Domains in den Firebase Authentication-Einstellungen hinzu.'
                    );
                } else if (error.code !== 'auth/popup-closed-by-user') {
                    alert(`Ein Authentifizierungsfehler ist aufgetreten: ${error.message}`);
                }
            });
    };

    const signOutUser = () => {
        signOut(auth).catch((error) => {
            console.error("Sign Out Error:", error);
        });
    };

    const renderFooter = () => {
        const parts = APP_CONFIG.footerTemplate.split(/(\{\{.*?\}\})/g);
        return parts.map((part, index) => {
          if (part === '{{heart}}') {
            return <HeartIcon key={index} className="h-5 w-5 inline-block align-middle text-primary mx-1 transition-colors duration-300 hover:text-primary-dark hover:animate-breathe" style={{ position: 'relative', top: '-1px' }} />;
          } else if (part === '{{link}}') {
            return <a key={index} href={APP_CONFIG.footerLink} target="_blank" rel="noopener noreferrer" className="hover:text-primary">{APP_CONFIG.footerLinkText}</a>;
          } else {
            return part;
          }
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background text-gray-200 flex flex-col items-center justify-center p-4">
                <AlpenblickLogo className="w-auto h-20 mb-6" src={APP_CONFIG.logoUrl} />
                <p className="text-lg text-text-muted">Wird geladen...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-background text-gray-200 flex flex-col items-center p-4">
                <div className="flex-grow flex flex-col items-center justify-center w-full max-w-md">
                    <AlpenblickLogo className="w-auto h-20 mb-6" src={APP_CONFIG.logoUrl} />
                    {/* "Willkommen" removed */}
                    <p className="text-lg text-text-muted mb-8 text-center">Bitte melde Dich an, um fortzufahren.</p>
                    <button
                        onClick={signInWithGoogle}
                        className="bg-primary-dark hover:bg-primary text-background font-bold py-2 px-4 rounded-lg flex items-center w-full justify-center sm:w-auto"
                    >
                        Mit Google anmelden
                    </button>
                </div>
                <footer className="text-center mt-12 text-text-dim text-sm pb-4">
                  <p>{renderFooter()}</p>
                </footer>
            </div>
        );
    }

    if (!isAuthorized) {
        return (
            <div className="min-h-screen bg-background text-gray-200 flex flex-col items-center justify-center p-4 text-center">
                 <AlpenblickLogo className="w-auto h-20 mb-6" src={APP_CONFIG.logoUrl} />
                <h1 className="text-3xl font-bold text-error mb-4">Unbefugter Zugriff</h1>
                <p className="text-lg text-text-muted mb-8">
                    Der Zugriff auf diese Anwendung ist beschränkt. Bitte melden Sie sich mit einem @alpenblick.gmbh-Konto an.
                </p>
                <p className="text-md text-text-dim mb-8">
                    Angemeldet als: {user.email}
                </p>
                <button
                    onClick={signOutUser}
                    className="bg-surface hover:bg-surface-hover text-text-dim hover:text-text-muted font-bold py-2 px-4 rounded-lg transition-colors"
                >
                    Abmelden
                </button>
            </div>
        );
    }

    return <MainApp />;
};

export default App;
