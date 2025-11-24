
import { useState, useEffect } from 'react';
import { auth } from './firebase';
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut, User } from 'firebase/auth';
import MainApp from './MainApp';
import { AlpenblickLogo } from './components/AlpenblickLogo';

const App = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
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
                        'Fehler: Diese Domain ist nicht für die Authentifizierung autorisiert.\n\n' +
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

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col items-center justify-center p-4">
                <AlpenblickLogo className="w-auto h-20 mb-6" src="https://alpenblick.net/media/AB_Logo_Kreativeagentur_rn.svg" />
                <p className="text-lg text-gray-400">Wird geladen...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col items-center justify-center p-4">
                 <AlpenblickLogo className="w-auto h-20 mb-6" src="https://alpenblick.net/media/AB_Logo_Kreativeagentur_rn.svg" />
                <h1 className="text-3xl font-bold mb-4">Willkommen</h1>
                <p className="text-lg text-gray-400 mb-8">Bitte melden Sie sich an, um fortzufahren.</p>
                <button
                    onClick={signInWithGoogle}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center"
                >
                    <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.75 8.36,4.73 12.19,4.73C15.28,4.73 17.04,6.55 17.04,6.55L19.25,4.34C19.25,4.34 16.56,2 12.19,2C6.42,2 2,6.48 2,12C2,17.52 6.42,22 12.19,22C17.6,22 21.54,18.33 21.54,12.81C21.54,11.83 21.45,11.45 21.35,11.1Z"/></svg>
                    Mit Google anmelden
                </button>
            </div>
        );
    }

    if (!isAuthorized) {
        return (
            <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col items-center justify-center p-4 text-center">
                 <AlpenblickLogo className="w-auto h-20 mb-6" src="https://alpenblick.net/media/AB_Logo_Kreativeagentur_rn.svg" />
                <h1 className="text-3xl font-bold text-red-500 mb-4">Unbefugter Zugriff</h1>
                <p className="text-lg text-gray-400 mb-8">
                    Der Zugriff auf diese Anwendung ist beschränkt. Bitte melden Sie sich mit einem @alpenblick.gmbh-Konto an.
                </p>
                <p className="text-md text-gray-500 mb-8">
                    Angemeldet als: {user.email}
                </p>
                <button
                    onClick={signOutUser}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg"
                >
                    Abmelden
                </button>
            </div>
        );
    }

    return <MainApp />;
};

export default App;
