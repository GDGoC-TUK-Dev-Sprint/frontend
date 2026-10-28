import React from 'react';
import { useTranslation } from 'react-i18next';
import ScreenPlaceholder from '../components/ScreenPlaceholder';

export default function ChatbotScreen() {
  const { t } = useTranslation();
  return <ScreenPlaceholder title={t('tabs.chatbot')} />;
}
