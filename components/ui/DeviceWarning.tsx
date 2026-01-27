'use client';

import React, { useState, useEffect } from 'react';
import { Smartphone, AlertCircle, Monitor } from 'lucide-react';
import styles from './DeviceWarning.module.css';

interface BrowserInfo {
    isSafari: boolean;
    isChrome: boolean;
    isMobile: boolean;
    isStandalone: boolean;
}

interface DeviceWarningProps {
    children: React.ReactNode;
    isAdmin?: boolean;
}

export const DeviceWarning = ({ children, isAdmin = false }: DeviceWarningProps) => {
    const [browserInfo, setBrowserInfo] = useState<BrowserInfo | null>(null);

    useEffect(() => {
        const checkBrowser = () => {
            const userAgent = navigator.userAgent.toLowerCase();

            // Detect Safari (but not Chrome on iOS which also has Safari in UA)
            const isSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent) && !/chromium/.test(userAgent);

            // Detect Chrome (including Chromium-based browsers)
            const isChrome = /chrome/.test(userAgent) || /chromium/.test(userAgent);

            // Check if MOBILE device (phones and tablets only)
            // Enhanced check for iPad handling (Macintosh UA + Touch)
            const isIpad = /macintosh/i.test(userAgent) && navigator.maxTouchPoints && navigator.maxTouchPoints > 1;

            const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent) ||
                isIpad ||
                ('ontouchstart' in window); // Relaxed width check for tablets

            // Check if standalone PWA mode
            const isStandalone = (window.navigator as any).standalone === true ||
                window.matchMedia('(display-mode: standalone)').matches ||
                window.matchMedia('(display-mode: fullscreen)').matches;

            setBrowserInfo({
                isSafari,
                isChrome,
                isMobile,
                isStandalone
            });
        };

        checkBrowser();

        const handleResize = () => {
            checkBrowser();
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // Still loading
    if (browserInfo === null) {
        return <>{children}</>;
    }

    const { isSafari, isChrome, isMobile, isStandalone } = browserInfo;
    const isSupportedBrowser = isSafari || isChrome;

    // ADMIN users can bypass PC restriction - show content on desktop
    if (!isMobile && isAdmin) {
        return <>{children}</>;
    }

    // If on DESKTOP/PC and NOT admin - show desktop warning (NO BYPASS for regular users)
    if (!isMobile) {
        return (
            <div className={styles.warningOverlay}>
                <div className={styles.warningModal}>
                    <div className={styles.warningIconRed}>
                        <Monitor size={60} />
                    </div>
                    <h2>Desktop Not Supported</h2>
                    <p className={styles.warningText}>
                        This app is designed for <strong>mobile devices only</strong>.
                    </p>
                    <div className={styles.instructions}>
                        <p>Please open this app on your mobile device:</p>
                        <ul>
                            <li><strong>iPhone / iPad</strong> → Use Safari</li>
                            <li><strong>Android</strong> → Use Google Chrome</li>
                        </ul>
                    </div>
                </div>
            </div>
        );
    }

    // If on mobile but NOT Safari or Chrome - show browser warning (NO BYPASS)
    if (!isSupportedBrowser) {
        return (
            <div className={styles.warningOverlay}>
                <div className={styles.warningModal}>
                    <div className={styles.warningIconOrange}>
                        <AlertCircle size={60} />
                    </div>
                    <h2>Unsupported Browser</h2>
                    <p className={styles.warningText}>
                        Please use <strong>Safari</strong> or <strong>Google Chrome</strong>.
                    </p>
                    <div className={styles.instructions}>
                        <ul>
                            <li><strong>iPhone / iPad</strong> → Use Safari</li>
                            <li><strong>Android</strong> → Use Google Chrome</li>
                        </ul>
                    </div>
                </div>
            </div>
        );
    }

    // If on mobile Safari/Chrome and in standalone/PWA mode - show content
    if (isStandalone) {
        return <>{children}</>;
    }

    // If on mobile Safari/Chrome but not in standalone mode - show add to home screen prompt (NO BYPASS)
    return (
        <div className={styles.warningOverlay}>
            <div className={styles.warningModal}>
                <div className={styles.warningIcon}>
                    <Smartphone size={60} />
                </div>
                <h2>Add to Home Screen</h2>
                <p className={styles.warningText}>
                    Please add this app to your home screen to use it.
                </p>

                <div className={styles.instructions}>
                    {isSafari ? (
                        <>
                            <p><strong>Safari (iPhone/iPad):</strong></p>
                            <ol>
                                <li>Tap the <strong>Share</strong> button ↗</li>
                                <li>Tap <strong>"Add to Home Screen"</strong></li>
                                <li>Tap <strong>"Add"</strong></li>
                                <li>Open from your home screen</li>
                            </ol>
                        </>
                    ) : (
                        <>
                            <p><strong>Chrome (Android):</strong></p>
                            <ol>
                                <li>Tap <strong>⋮</strong> (three dots menu)</li>
                                <li>Tap <strong>"Add to Home Screen"</strong></li>
                                <li>Tap <strong>"Add"</strong></li>
                                <li>Open from your home screen</li>
                            </ol>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
