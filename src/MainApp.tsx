
import React, { useState, useEffect, useCallback } from 'react';
import { PDFDocument } from 'pdf-lib';
import { gapi } from 'gapi-script';

const CLIENT_ID = '600072389128-l98ip8fqg04eqtp8vsduo2tlvhfp1mml.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
}

const MainApp: React.FC = () => {
    const [files, setFiles] = useState<DriveFile[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isRenaming, setIsRenaming] = useState(false);

    useEffect(() => {
        // Initialize the Google API client
        const initClient = () => {
            gapi.client.init({ clientId: CLIENT_ID, scope: SCOPES });
        };
        gapi.load('client:auth2', initClient);
    }, []);

    const listPDFFiles = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Ensure the user is authenticated
            const authInstance = gapi.auth2.getAuthInstance();
            const isSignedIn = authInstance.isSignedIn.get();
            if (!isSignedIn) {
                // If not signed in, try to sign in silently. If that fails, prompt for login.
                try {
                    await authInstance.signIn({ prompt: 'none' });
                } catch (e) {
                    await authInstance.signIn();
                }
            }

            const response = await gapi.client.drive.files.list({
                q: "mimeType='application/pdf' and trashed=false",
                fields: 'files(id, name, mimeType, webViewLink)',
                pageSize: 50,
            });

            if (response.result.files) {
                setFiles(response.result.files as DriveFile[]);
            }
        } catch (err: any) {
            console.error('Error listing files:', err);
            setError(`Fehler beim Laden der Dateien: ${err.message || 'Unbekannter Fehler'}`);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const renameFile = useCallback(async (fileId: string, oldName: string) => {
        try {
            const response = await gapi.client.drive.files.get({ fileId: fileId, alt: 'media' });
            const pdfDoc = await PDFDocument.load(response.body);
            const keywords = pdfDoc.getKeywords();
            if (keywords) {
                const newName = `${keywords}.pdf`;
                await gapi.client.drive.files.update({ fileId: fileId, resource: { name: newName } });
                return newName;
            }
            return oldName; // No keywords found, return original name
        } catch (err) {
            console.error(`Error renaming file ${fileId}:`, err);
            return oldName; // Return original name on error
        }
    }, []);

    const handleRenameAll = useCallback(async () => {
        setIsRenaming(true);
        setError(null);
        const promises = files.map(file => renameFile(file.id, file.name));
        try {
            await Promise.all(promises);
            // Refresh the file list to show new names
            listPDFFiles();
        } catch (err) {
            setError('Ein Fehler ist beim Umbenennen aufgetreten.');
        } finally {
            setIsRenaming(false);
        }
    }, [files, renameFile, listPDFFiles]);

    return (
        <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '800px', margin: 'auto' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Dokumenten-Renamer</h1>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem', gap: '1rem' }}>
                <button onClick={listPDFFiles} disabled={isLoading} style={{ padding: '0.5rem 1rem', fontSize: '1rem' }}>
                    {isLoading ? 'Lade...' : 'PDF-Dateien aus Google Drive laden'}
                </button>
                {files.length > 0 && (
                    <button onClick={handleRenameAll} disabled={isRenaming} style={{ padding: '0.5rem 1rem', fontSize: '1rem', backgroundColor: '#4CAF50', color: 'white' }}>
                        {isRenaming ? 'Benenne um...' : 'Alle umbenennen'}
                    </button>
                )}
            </div>

            {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

            {files.length > 0 ? (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {files.map(file => (
                        <li key={file.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', borderBottom: '1px solid #ccc' }}>
                            <span>{file.name}</span>
                            <a href={file.webViewLink} target="_blank" rel="noopener noreferrer">Öffnen</a>
                        </li>
                    ))}
                </ul>
            ) : (
                !isLoading && <p style={{ textAlign: 'center' }}>Bitte laden Sie Ihre PDF-Dateien, um sie hier anzuzeigen.</p>
            )}
        </div>
    );
};

export default MainApp;
