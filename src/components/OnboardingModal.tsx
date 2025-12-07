import { useEffect, useState } from 'react';
import { BookOpen, Search, Command, Cloud, ChevronRight, ChevronLeft, Settings } from 'lucide-react';
import { Modal } from './Modal';
import { useAuth } from '../AuthContext';

export function OnboardingModal() {
    const { user, signInWithGoogle } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    const steps = [
        {
            title: "Welcome to SQL Codex",
            content: (
                <div style={{ textAlign: 'center' }}>
                    <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--accent-primary)'
                        }}>
                            <BookOpen size={40} />
                        </div>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '1.05rem', marginBottom: '1rem' }}>
                        SQL Codexは、開発者のためのスマートなナレッジベースです。<br />
                        日々の開発で出会うDBMSのコマンドや関数を、ここにストックしましょう。
                    </p>
                </div>
            )
        },
        {
            title: "主な機能",
            content: (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{
                            padding: '10px',
                            borderRadius: '10px',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            color: 'var(--accent-primary)',
                            flexShrink: 0
                        }}>
                            <Search size={20} />
                        </div>
                        <div>
                            <h3 style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '0.95rem' }}>スマートな検索</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>DBMSやタグで瞬時に関数をフィルタリング。</p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{
                            padding: '10px',
                            borderRadius: '10px',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            color: '#10b981',
                            flexShrink: 0
                        }}>
                            <BookOpen size={20} />
                        </div>
                        <div>
                            <h3 style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '0.95rem' }}>ナレッジの蓄積</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>使い方の背景や注意点も詳細に記録。</p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{
                            padding: '10px',
                            borderRadius: '10px',
                            backgroundColor: 'rgba(245, 158, 11, 0.1)',
                            color: '#f59e0b',
                            flexShrink: 0
                        }}>
                            <Command size={20} />
                        </div>
                        <div>
                            <h3 style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '0.95rem' }}>マルチDBMS対応</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>複数のDBMSでの違いもタグで管理。</p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "クラウド同期",
            content: (
                <div style={{ textAlign: 'center' }}>
                    <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(139, 92, 246, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#8b5cf6'
                        }}>
                            <Cloud size={40} />
                        </div>
                    </div>
                    <h3 style={{ fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '1rem' }}>
                        どこでもアクセス可能に
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                        Googleアカウントで連携すれば、あなたのナレッジライブラリをクラウドに安全に保存できます。<br />
                        PCでもスマホでも、いつでも同じデータにアクセスしましょう。
                    </p>

                    {!user && (
                        <button
                            onClick={() => {
                                // Save flag before OAuth redirect to prevent modal from reappearing
                                localStorage.setItem('sql-codex-onboarding-shown', 'true');
                                signInWithGoogle();
                            }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.75rem',
                                padding: '0.75rem 1.5rem',
                                borderRadius: '8px',
                                backgroundColor: 'white',
                                color: '#333',
                                fontWeight: 'bold',
                                border: '1px solid var(--border-color)',
                                fontSize: '0.95rem',
                                cursor: 'pointer',
                                width: '100%',
                                maxWidth: '280px',
                                margin: '0 auto 1rem'
                            }}
                        >
                            <svg width="18" height="18" viewBox="0 0 48 48">
                                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                            </svg>
                            Googleでサインイン
                        </button>
                    )}

                    {user && (
                        <div style={{
                            padding: '0.75rem 1rem',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            borderRadius: '8px',
                            color: '#10b981',
                            fontSize: '0.9rem',
                            marginBottom: '1rem'
                        }}>
                            ✓ {user.email} で連携中
                        </div>
                    )}

                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                        <Settings size={14} />
                        後から設定画面でも連携できます
                    </p>
                </div>
            )
        }
    ];

    useEffect(() => {
        const hasSeenOnboarding = localStorage.getItem('sql-codex-onboarding-shown');
        if (!hasSeenOnboarding) {
            setIsOpen(true);
        }
    }, []);

    const handleClose = () => {
        setIsOpen(false);
        localStorage.setItem('sql-codex-onboarding-shown', 'true');
    };

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(c => c + 1);
        } else {
            handleClose();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(c => c - 1);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={steps[currentStep].title} maxWidth="500px">
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '350px' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    {steps[currentStep].content}
                </div>

                <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Navigation Buttons */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <button
                            onClick={handleBack}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                color: 'var(--text-secondary)',
                                padding: '0.5rem',
                                borderRadius: '4px',
                                border: 'none',
                                backgroundColor: 'transparent',
                                cursor: currentStep === 0 ? 'default' : 'pointer',
                                opacity: currentStep === 0 ? 0 : 1,
                                transition: 'opacity 0.2s',
                                fontSize: '0.9rem'
                            }}
                            disabled={currentStep === 0}
                        >
                            <ChevronLeft size={20} />
                            Back
                        </button>

                        <button
                            onClick={handleNext}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.75rem 1.5rem',
                                borderRadius: '8px',
                                backgroundColor: 'var(--accent-primary)',
                                color: 'white',
                                fontWeight: 'bold',
                                border: 'none',
                                fontSize: '1rem',
                                cursor: 'pointer',
                                boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)',
                                transition: 'transform 0.1s'
                            }}
                            className="hover-scale"
                        >
                            {currentStep === steps.length - 1 ? 'Start' : 'Next'}
                            {currentStep < steps.length - 1 && <ChevronRight size={20} />}
                        </button>
                    </div>

                    {/* Dots Indicator */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                        {steps.map((_, idx) => (
                            <div
                                key={idx}
                                style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    backgroundColor: idx === currentStep ? 'var(--accent-primary)' : 'var(--border-color)',
                                    transition: 'background-color 0.3s'
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </Modal>
    );
}
