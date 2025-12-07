import { createContext, useContext, useState, type ReactNode } from 'react';

type Language = 'ja' | 'en';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
    en: {
        // Settings
        'settings.title': 'Settings',
        'settings.save': 'Save',
        'settings.saved': 'Saved!',
        'settings.language': 'Language',
        'settings.accountSync': 'Account & Sync',
        'settings.loggedInAs': 'Logged in as:',
        'settings.syncNow': 'Sync Now',
        'settings.syncing': 'Syncing...',
        'settings.logout': 'Logout',
        'settings.signInPrompt': 'Sign in to sync your data to the cloud.',
        'settings.signInWithGoogle': 'Sign in with Google',
        'settings.dbmsOptions': 'DBMS Options',
        'settings.dbmsDescription': 'Enter available DBMS options, separated by commas.',
        'settings.dbmsPlaceholder': 'e.g., PostgreSQL, MySQL, SQLite, Oracle, SQL Server',
        'settings.tagOptions': 'Tag Options',
        'settings.tagDescription': 'Enter available tags, separated by commas.',
        'settings.tagPlaceholder': 'e.g., date, string, aggregation, window-function, json',

        // Library (FunctionList)
        'library.title': 'Library',
        'library.noFunctions': 'No functions found matching your filters.',
        'library.clearFilters': 'Clear Filters',
        'library.searchFilters': 'Search Filters',
        'library.specifyConditions': 'Specify search conditions',
        'library.clear': 'Clear',
        'library.showResults': 'Show Results',
        'library.supportedDbms': 'Supported DBMS:',
        'library.description': 'Description',
        'library.usage': 'Usage',
        'library.tags': 'Tags',
        'library.confirmDelete': 'Are you sure you want to delete this function?',

        // Editor (FunctionEditor)
        'editor.newFunction': 'New Function',
        'editor.editFunction': 'Edit Function',
        'editor.save': 'Save',
        'editor.delete': 'Delete',
        'editor.functionName': 'Function Name',
        'editor.functionNamePlaceholder': 'e.g., DATE_TRUNC',
        'editor.dbms': 'DBMS',
        'editor.selectDbms': 'Select DBMS...',
        'editor.tags': 'Tags',
        'editor.selectTags': 'Select Tags...',
        'editor.configureInSettings': 'Configure options in Settings',
        'editor.description': 'Description',
        'editor.descriptionPlaceholder': 'What does this function do?',
        'editor.usageExample': 'Usage / Example',
        'editor.usagePlaceholder': 'SELECT ...',
        'editor.confirmDelete': 'Are you sure you want to delete this function?',

        // Search
        'search.placeholder': 'Search by function name...',
        'search.dbms': 'DBMS',
        'search.tags': 'Tags',
        'search.selected': 'selected',

        // MultiSelect
        'multiselect.filterOptions': 'Filter options...',
        'multiselect.noOptions': 'No options found',

        // Onboarding
        'onboarding.welcome': 'Welcome to SQL Codex',
        'onboarding.introText': 'SQL Codex is a smart knowledge base for developers. Store the DBMS commands and functions you encounter in your daily development here.',
        'onboarding.features': 'Key Features',
        'onboarding.smartSearch': 'Smart Search',
        'onboarding.smartSearchDesc': 'Instantly filter functions by DBMS or tags.',
        'onboarding.knowledge': 'Knowledge Storage',
        'onboarding.knowledgeDesc': 'Record detailed usage backgrounds and notes.',
        'onboarding.multiDbms': 'Multi-DBMS Support',
        'onboarding.multiDbmsDesc': 'Manage differences across DBMSs with tags.',
        'onboarding.cloudSync': 'Cloud Sync',
        'onboarding.accessAnywhere': 'Access Anywhere',
        'onboarding.cloudSyncDesc': 'Link with your Google account to safely store your knowledge library in the cloud. Access the same data from PC or smartphone, anytime.',
        'onboarding.signInWithGoogle': 'Sign in with Google',
        'onboarding.linkedWith': 'Linked with',
        'onboarding.laterInSettings': 'You can also link later from Settings',
        'onboarding.next': 'Next',
        'onboarding.back': 'Back',
        'onboarding.start': 'Start',
    },
    ja: {
        // Settings
        'settings.title': '設定',
        'settings.save': '保存',
        'settings.saved': '保存しました！',
        'settings.language': '言語',
        'settings.accountSync': 'アカウント & 同期',
        'settings.loggedInAs': 'ログイン中:',
        'settings.syncNow': '今すぐ同期',
        'settings.syncing': '同期中...',
        'settings.logout': 'ログアウト',
        'settings.signInPrompt': 'サインインしてデータをクラウドに同期しましょう。',
        'settings.signInWithGoogle': 'Googleでサインイン',
        'settings.dbmsOptions': 'DBMSオプション',
        'settings.dbmsDescription': '利用可能なDBMSをカンマ区切りで入力してください。',
        'settings.dbmsPlaceholder': '例: PostgreSQL, MySQL, SQLite, Oracle, SQL Server',
        'settings.tagOptions': 'タグオプション',
        'settings.tagDescription': '利用可能なタグをカンマ区切りで入力してください。',
        'settings.tagPlaceholder': '例: 日付, 文字列, 集計, ウィンドウ関数, JSON',

        // Library (FunctionList)
        'library.title': 'ライブラリ',
        'library.noFunctions': 'フィルター条件に一致する関数がありません。',
        'library.clearFilters': 'フィルターをクリア',
        'library.searchFilters': '検索フィルター',
        'library.specifyConditions': '検索条件を指定してください',
        'library.clear': 'クリア',
        'library.showResults': '結果を表示',
        'library.supportedDbms': '対応DBMS:',
        'library.description': '説明',
        'library.usage': '使い方',
        'library.tags': 'タグ',
        'library.confirmDelete': 'この関数を削除してもよろしいですか？',

        // Editor (FunctionEditor)
        'editor.newFunction': '新規関数',
        'editor.editFunction': '関数を編集',
        'editor.save': '保存',
        'editor.delete': '削除',
        'editor.functionName': '関数名',
        'editor.functionNamePlaceholder': '例: DATE_TRUNC',
        'editor.dbms': 'DBMS',
        'editor.selectDbms': 'DBMSを選択...',
        'editor.tags': 'タグ',
        'editor.selectTags': 'タグを選択...',
        'editor.configureInSettings': '設定画面でオプションを追加',
        'editor.description': '説明',
        'editor.descriptionPlaceholder': 'この関数は何をしますか？',
        'editor.usageExample': '使い方 / 例',
        'editor.usagePlaceholder': 'SELECT ...',
        'editor.confirmDelete': 'この関数を削除してもよろしいですか？',

        // Search
        'search.placeholder': '関数名で検索...',
        'search.dbms': 'DBMS',
        'search.tags': 'タグ',
        'search.selected': '件選択中',

        // MultiSelect
        'multiselect.filterOptions': '絞り込み...',
        'multiselect.noOptions': 'オプションがありません',

        // Onboarding
        'onboarding.welcome': 'SQL Codexへようこそ',
        'onboarding.introText': 'SQL Codexは、開発者のためのスマートなナレッジベースです。日々の開発で出会うDBMSのコマンドや関数を、ここにストックしましょう。',
        'onboarding.features': '主な機能',
        'onboarding.smartSearch': 'スマートな検索',
        'onboarding.smartSearchDesc': 'DBMSやタグで瞬時に関数をフィルタリング。',
        'onboarding.knowledge': 'ナレッジの蓄積',
        'onboarding.knowledgeDesc': '使い方の背景や注意点も詳細に記録。',
        'onboarding.multiDbms': 'マルチDBMS対応',
        'onboarding.multiDbmsDesc': '複数のDBMSでの違いもタグで管理。',
        'onboarding.cloudSync': 'クラウド同期',
        'onboarding.accessAnywhere': 'どこでもアクセス可能に',
        'onboarding.cloudSyncDesc': 'Googleアカウントで連携すれば、あなたのナレッジライブラリをクラウドに安全に保存できます。PCでもスマホでも、いつでも同じデータにアクセスしましょう。',
        'onboarding.signInWithGoogle': 'Googleでサインイン',
        'onboarding.linkedWith': 'で連携中',
        'onboarding.laterInSettings': '後から設定画面でも連携できます',
        'onboarding.next': '次へ',
        'onboarding.back': '戻る',
        'onboarding.start': '始める',
    }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>(() => {
        const saved = localStorage.getItem('sql-codex-language');
        return (saved as Language) || 'ja';
    });

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('sql-codex-language', lang);
    };

    const t = (key: string): string => {
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
