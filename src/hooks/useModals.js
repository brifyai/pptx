/**
 * Hook for managing modal states
 */
import { useState, useCallback } from 'react'

export function useModals() {
  const [modals, setModals] = useState({
    export: false,
    history: false,
    assets: false,
    themes: false,
    analytics: false,
    contentImporter: false,
    templateLibrary: false,
    textImporter: false,
    presentationHistory: false,
    keyboardHelp: false,
    onboarding: false,
    profile: false,
    shareModal: false,
    variantGenerator: false,
    contentSuggestions: false,
    textOnlyMode: false,
    mobileMenu: false,
    createModal: false,
    slideOptions: false
  })

  const openModal = useCallback((modalName) => {
    setModals(prev => ({ ...prev, [modalName]: true }))
  }, [])

  const closeModal = useCallback((modalName) => {
    setModals(prev => ({ ...prev, [modalName]: false }))
  }, [])

  const toggleModal = useCallback((modalName) => {
    setModals(prev => ({ ...prev, [modalName]: !prev[modalName] }))
  }, [])

  const closeAllModals = useCallback(() => {
    setModals({
      export: false,
      history: false,
      assets: false,
      themes: false,
      analytics: false,
      contentImporter: false,
      templateLibrary: false,
      textImporter: false,
      presentationHistory: false,
      keyboardHelp: false,
      profile: false,
      shareModal: false,
      variantGenerator: false,
      contentSuggestions: false,
      textOnlyMode: false,
      onboarding: false,
      mobileMenu: false,
      createModal: false,
      slideOptions: false
    })
  }, [])

  return {
    modals,
    openModal,
    closeModal,
    toggleModal,
    closeAllModals,
    // Convenience getters
    showExport: modals.export,
    showHistory: modals.history,
    showAssets: modals.assets,
    showThemes: modals.themes,
    showAnalytics: modals.analytics,
    showContentImporter: modals.contentImporter,
    showTemplateLibrary: modals.templateLibrary,
    showTextImporter: modals.textImporter,
    showPresentationHistory: modals.presentationHistory,
    showKeyboardHelp: modals.keyboardHelp,
    showOnboarding: modals.onboarding,
    showProfile: modals.profile,
    showShareModal: modals.shareModal,
    showVariantGenerator: modals.variantGenerator,
    showContentSuggestions: modals.contentSuggestions,
    showTextOnlyMode: modals.textOnlyMode,
    showMobileMenu: modals.mobileMenu,
    showCreateModal: modals.createModal,
    showSlideOptions: modals.slideOptions,
    // Convenience setters
    setShowExport: (v) => v ? openModal('export') : closeModal('export'),
    setShowHistory: (v) => v ? openModal('history') : closeModal('history'),
    setShowAssets: (v) => v ? openModal('assets') : closeModal('assets'),
    setShowThemes: (v) => v ? openModal('themes') : closeModal('themes'),
    setShowAnalytics: (v) => v ? openModal('analytics') : closeModal('analytics'),
    setShowContentImporter: (v) => v ? openModal('contentImporter') : closeModal('contentImporter'),
    setShowTemplateLibrary: (v) => v ? openModal('templateLibrary') : closeModal('templateLibrary'),
    setShowTextImporter: (v) => v ? openModal('textImporter') : closeModal('textImporter'),
    setShowPresentationHistory: (v) => v ? openModal('presentationHistory') : closeModal('presentationHistory'),
    setShowKeyboardHelp: (v) => v ? openModal('keyboardHelp') : closeModal('keyboardHelp'),
    setShowOnboarding: (v) => v ? openModal('onboarding') : closeModal('onboarding'),
    setShowProfile: (v) => v ? openModal('profile') : closeModal('profile'),
    setShowShareModal: (v) => v ? openModal('shareModal') : closeModal('shareModal'),
    setShowVariantGenerator: (v) => v ? openModal('variantGenerator') : closeModal('variantGenerator'),
    setShowContentSuggestions: (v) => v ? openModal('contentSuggestions') : closeModal('contentSuggestions'),
    setShowTextOnlyMode: (v) => v ? openModal('textOnlyMode') : closeModal('textOnlyMode'),
    setShowMobileMenu: (v) => v ? openModal('mobileMenu') : closeModal('mobileMenu'),
    setShowCreateModal: (v) => v ? openModal('createModal') : closeModal('createModal'),
    setShowSlideOptions: (v) => v ? openModal('slideOptions') : closeModal('slideOptions')
  }
}
