import { createContext, useContext, useState, type ReactNode, useCallback } from 'react';
import { ConfirmDialog } from './components/ConfirmDialog';
import { useLanguage } from './i18n';

interface UnsavedChangesContextType {
    hasUnsavedChanges: boolean;
    setHasUnsavedChanges: (value: boolean) => void;
    confirmNavigation: (onConfirm: () => void) => void;
}

const UnsavedChangesContext = createContext<UnsavedChangesContextType | undefined>(undefined);

export function UnsavedChangesProvider({ children }: { children: ReactNode }) {
    const { t } = useLanguage();
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);

    const confirmNavigation = useCallback((onConfirm: () => void) => {
        if (hasUnsavedChanges) {
            setPendingNavigation(() => onConfirm);
        } else {
            onConfirm();
        }
    }, [hasUnsavedChanges]);

    const handleConfirm = () => {
        if (pendingNavigation) {
            setHasUnsavedChanges(false);
            pendingNavigation();
        }
        setPendingNavigation(null);
    };

    const handleCancel = () => {
        setPendingNavigation(null);
    };

    return (
        <UnsavedChangesContext.Provider value={{ hasUnsavedChanges, setHasUnsavedChanges, confirmNavigation }}>
            {children}
            <ConfirmDialog
                isOpen={pendingNavigation !== null}
                title={t('dialog.unsavedTitle')}
                message={t('dialog.unsavedMessage')}
                confirmText={t('dialog.leaveWithoutSaving')}
                cancelText={t('dialog.stayOnPage')}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
                variant="warning"
            />
        </UnsavedChangesContext.Provider>
    );
}

export function useUnsavedChanges() {
    const context = useContext(UnsavedChangesContext);
    if (!context) {
        throw new Error('useUnsavedChanges must be used within an UnsavedChangesProvider');
    }
    return context;
}
