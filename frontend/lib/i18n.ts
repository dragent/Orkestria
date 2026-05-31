export type Language = "fr" | "en";

export type Translations = {
  signIn: string;
  signOut: string;
  registerLink: string;
  getStarted: string;
  viewAll: string;
  view: string;
  admin: string;
  user: string;
  active: string;
  inactive: string;
  noCompany: string;
  home: {
    heroTitle: string;
    heroTitleHighlight: string;
    heroSubtitle: string;
    startFree: string;
    signInAccount: string;
    dataOwnership: string;
    projectsSupported: string;
    available: string;
    featuresTitle: string;
    featuresSubtitle: string;
    ctaTitle: string;
    ctaSubtitle: string;
    ctaButton: string;
    features: {
      orchestration: { title: string; description: string };
      team: { title: string; description: string };
      multiTenant: { title: string; description: string };
      secure: { title: string; description: string };
    };
  };
  authTagline: string;
  authSubtitle: string;
  login: {
    title: string;
    subtitle: string;
    emailLabel: string;
    emailPlaceholder: string;
    passwordLabel: string;
    submitLoading: string;
    submit: string;
    noAccount: string;
    createOne: string;
    forgotPassword: string;
    successMessage: string;
    verifiedMessage: string;
    verifyErrorMessage: string;
    passwordResetMessage: string;
    invalidCredentials: string;
    emailNotVerified: string;
    invalidEmail: string;
    passwordRequired: string;
  };
  forgotPassword: {
    title: string;
    subtitle: string;
    emailLabel: string;
    emailPlaceholder: string;
    submit: string;
    submitLoading: string;
    backToLogin: string;
    successTitle: string;
    successBody: string;
    successSpam: string;
    invalidEmail: string;
    failed: string;
  };
  resetPassword: {
    title: string;
    subtitle: string;
    passwordLabel: string;
    confirmPasswordLabel: string;
    submit: string;
    submitLoading: string;
    backToLogin: string;
    successTitle: string;
    successBody: string;
    passwordMin: string;
    passwordUppercase: string;
    passwordNumber: string;
    confirmPasswordRequired: string;
    passwordsMismatch: string;
    invalidToken: string;
    failed: string;
  };
  register: {
    title: string;
    subtitle: string;
    firstNameLabel: string;
    lastNameLabel: string;
    emailLabel: string;
    emailPlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    confirmPasswordLabel: string;
    submitLoading: string;
    submit: string;
    alreadyAccount: string;
    signIn: string;
    registrationFailed: string;
    firstNameRequired: string;
    lastNameRequired: string;
    invalidEmail: string;
    passwordMin: string;
    passwordUppercase: string;
    passwordNumber: string;
    confirmPasswordRequired: string;
    passwordsMismatch: string;
    checkEmailTitle: string;
    checkEmailSubtitle: string;
    checkEmailBody: string;
    checkEmailSpam: string;
  };
  nav: {
    dashboard: string;
    users: string;
    companies: string;
    clients: string;
    projects: string;
    employees: string;
    roleScopes: string;
    tickets: string;
    btpRh: string;
    kanban: string;
    leavesNav: string;
    profile: string;
    signOut: string;
    switchToUserMode: string;
    clientView: string;
    backToAdmin: string;
  };
  adminForms: {
    newCompany: string;
    editCompany: string;
    companyName: string;
    companySlug: string;
    save: string;
    saving: string;
    newUser: string;
    password: string;
    rolesLabel: string;
    companyAssignment: string;
    noCompanyOption: string;
    adminSettings: string;
    saveUser: string;
    createUser: string;
    addCompany: string;
    edit: string;
    addUser: string;
    genericError: string;
    changesSaved: string;
    documentAccess: string;
    selectRolePlaceholder: string;
  };
  spaces: {
    clientTitle: string;
    clientBody: string;
    subcontractorTitle: string;
    subcontractorBody: string;
  };
  dashboard: {
    title: string;
    subtitle: string;
    totalUsers: string;
    activeUsers: string;
    companies: string;
    totalProjects: string;
    recentUsers: string;
    viewAll: string;
    noUsers: string;
    noCompanies: string;
    loadError: string;
  };
  users: {
    title: string;
    subtitle: string;
    colUser: string;
    colRole: string;
    colCompany: string;
    colStatus: string;
    colJoined: string;
    noUsers: string;
    loadError: string;
  };
  userDetail: {
    backLabel: string;
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    company: string;
    status: string;
    joined: string;
    loadError: string;
  };
  companies: {
    title: string;
    subtitle: string;
    colCompany: string;
    colSlug: string;
    colMembers: string;
    colCreated: string;
    noCompanies: string;
    loadError: string;
  };
  companyDetail: {
    backLabel: string;
    companyId: string;
    slug: string;
    created: string;
    members: string;
    activeMembers: string;
    membersTitle: string;
    noMembers: string;
    colUser: string;
    colRole: string;
    colStatus: string;
    loadError: string;
  };
  clients: {
    title: string;
    subtitle: string;
    colName: string;
    colEmail: string;
    colCompany: string;
    add: string;
    newTitle: string;
    loadError: string;
    none: string;
    back: string;
  };
  projects: {
    title: string;
    subtitle: string;
    colTitle: string;
    colClient: string;
    colPipeline: string;
    colCreated: string;
    filterSearch: string;
    filterPipeline: string;
    allPipelines: string;
    add: string;
    newTitle: string;
    loadError: string;
    none: string;
    back: string;
    listView: string;
  };
  kanban: {
    subtitle: string;
  };
  projectDetail: {
    dates: string;
    start: string;
    end: string;
    pipeline: string;
  };
  pipeline: {
    contact: string;
    meeting: string;
    engineer_assigned: string;
    quote_plan: string;
    quote_signed: string;
    invoice_sent: string;
    deposit_received: string;
    design_started: string;
    design_completed: string;
    client_signed: string;
    components_ordered: string;
    construction: string;
    subcontractors: string;
    site_visit: string;
    paid: string;
    advanceButton: string;
    advanceTo: string;
    noPermission: string;
    terminal: string;
      historyTitle: string;
      historyEmpty: string;
      historyFrom: string;
      historyTo: string;
      historyBy: string;
      notePlaceholder: string;
    };
  documents: {
    title: string;
    upload: string;
    scope: string;
    file: string;
    filterScope: string;
    allScopes: string;
    download: string;
    none: string;
    loadError: string;
    scopeRh: string;
    scopeTech: string;
    scopeFinance: string;
    scopeDesign: string;
    scopeLegal: string;
  };
  roleScopes: {
    title: string;
    subtitle: string;
    save: string;
    saving: string;
    saveOk: string;
    loadError: string;
    noPolicy: string;
  };
  employees: {
    title: string;
    subtitle: string;
    add: string;
    newTitle: string;
    colName: string;
    colRole: string;
    colCompany: string;
    colRate: string;
    colSkills: string;
    none: string;
    loadError: string;
    back: string;
    firstName: string;
    lastName: string;
    role: string;
    skills: string;
    skillsPlaceholder: string;
    dailyRate: string;
    linkedUser: string;
    save: string;
    saving: string;
  };
  tasks: {
    title: string;
    add: string;
    none: string;
    loadError: string;
    titleLabel: string;
    description: string;
    status: string;
    dueDate: string;
    assignee: string;
    noAssignee: string;
    statusOpen: string;
    statusInProgress: string;
    statusDone: string;
    save: string;
    saving: string;
    delete: string;
  };
  tickets: {
    title: string;
    subtitle: string;
    add: string;
    new: string;
    none: string;
    loadError: string;
    titleLabel: string;
    description: string;
    status: string;
    priority: string;
    type: string;
    source: string;
    project: string;
    noProject: string;
    assignee: string;
    noAssignee: string;
    reporter: string;
    createdAt: string;
    updatedAt: string;
    filters: string;
    search: string;
    all: string;
    boardView: string;
    listView: string;
    searchPlaceholder: string;
    allPriorities: string;
    allTypes: string;
    clearFilters: string;
    save: string;
    saving: string;
    cancel: string;
    delete: string;
    confirmDelete: string;
    comments: string;
    addComment: string;
    commentPlaceholder: string;
    sendComment: string;
    sending: string;
    backToList: string;
    slaTitle: string;
    slaCreated: string;
    slaFirstResponse: string;
    slaResolved: string;
    slaStatus: string;
    slaMinutes: string;
    slaPending: string;
    statusOpen: string;
    statusInProgress: string;
    statusInReview: string;
    statusDone: string;
    statusClosed: string;
    priorityLow: string;
    priorityNormal: string;
    priorityHigh: string;
    priorityUrgent: string;
    typeBug: string;
    typeFeature: string;
    typeTask: string;
    typeSupport: string;
    typeIncident: string;
    sourceInternal: string;
    sourceClient: string;
    clientSection: {
      title: string;
      subtitle: string;
      open: string;
      noTickets: string;
    };
    devSpace: {
      title: string;
      subtitle: string;
      myAssigned: string;
      noAssigned: string;
      urgentUnanswered: string;
      waitingSince: string;
      noResponseFor: string;
      recentlyResolved: string;
      resolvedIn: string;
    };
  };
  timeTracking: {
    title: string;
    add: string;
    none: string;
    employee: string;
    hours: string;
    date: string;
    description: string;
    hourType: string;
    hourTypeRegular: string;
    hourTypeNight: string;
    hourTypeWeekend: string;
    hourTypeTravel: string;
    hourTypeOnCall: string;
    save: string;
    saving: string;
    totalHours: string;
    delete: string;
  };
  quotes: {
    title: string;
    add: string;
    none: string;
    loadError: string;
    newTitle: string;
    back: string;
    label: string;
    quantity: string;
    unitPrice: string;
    total: string;
    addLine: string;
    removeLine: string;
    notes: string;
    statusDraft: string;
    statusSent: string;
    statusAccepted: string;
    statusRejected: string;
    send: string;
    accept: string;
    reject: string;
    viewPdf: string;
    grandTotal: string;
    save: string;
    saving: string;
    deleteConfirm: string;
  };
  invoices: {
    title: string;
    none: string;
    loadError: string;
    statusDraft: string;
    statusSent: string;
    statusPaid: string;
    markPaid: string;
    viewPdf: string;
    total: string;
    paidAt: string;
  };
  classification: {
    pending: string;
    done: string;
    error: string;
    label: string;
    editLabel: string;
    save: string;
  };
  subcontractor: {
    projectsTitle: string;
    projectsSubtitle: string;
    noProjects: string;
    loadError: string;
    myTasks: string;
    markDone: string;
  };
  clientSpace: {
    projectsTitle: string;
    projectsSubtitle: string;
    noProjects: string;
    loadError: string;
    quotesTitle: string;
    invoicesTitle: string;
  };
  btpRh: {
    title: string;
    subtitle: string;
    kpisTitle: string;
    acceptedQuotes: string;
    hoursLast30Days: string;
    complianceDue30Days: string;
    projectsByStage: string;
    payrollTitle: string;
    from: string;
    to: string;
    companyFilter: string;
    allCompanies: string;
    downloadCsv: string;
    downloading: string;
    deadlinesTitle: string;
    addDeadline: string;
    titleLabel: string;
    categoryLabel: string;
    expiresLabel: string;
    notesLabel: string;
    companyLabel: string;
    optionalEmployeeId: string;
    optionalProjectId: string;
    save: string;
    saving: string;
    delete: string;
    confirmDelete: string;
    loadError: string;
    noDeadlines: string;
    categoryCertification: string;
    categoryInsurance: string;
    categoryMedical: string;
    categoryOther: string;
    filterUpcoming: string;
    editDeadline: string;
    cancelEdit: string;
    updateDeadline: string;
    updating: string;
    actualLaborCost: string;
    margin: string;
    pendingLeaves: string;
  };
  leaves: {
    title: string;
    subtitle: string;
    addLeave: string;
    noLeaves: string;
    loadError: string;
    employeeLabel: string;
    typeLabel: string;
    statusLabel: string;
    startsLabel: string;
    endsLabel: string;
    reasonLabel: string;
    save: string;
    saving: string;
    approve: string;
    approving: string;
    reject: string;
    rejecting: string;
    delete: string;
    confirmDelete: string;
    confirmApprove: string;
    confirmReject: string;
    filterStatus: string;
    filterType: string;
    allStatuses: string;
    allTypes: string;
    workingDays: string;
    approvedBy: string;
    approvedAt: string;
    typePaidVacation: string;
    typeRtt: string;
    typeSick: string;
    typeTraining: string;
    typeOther: string;
    statusPending: string;
    statusApproved: string;
    statusRejected: string;
    statusCancelled: string;
    allCompanies: string;
    allEmployees: string;
    viewList: string;
    viewCalendar: string;
  };
};

export const translations: Record<Language, Translations> = {
  fr: {
    signIn: "Se connecter",
    signOut: "Se déconnecter",
    registerLink: "S'inscrire",
    getStarted: "Commencer",
    viewAll: "Voir tout",
    view: "Voir →",
    admin: "Administrateur",
    user: "Utilisateur",
    active: "Actif",
    inactive: "Inactif",
    noCompany: "Aucune entreprise",
    home: {
      heroTitle: "Orchestrez vos projets,",
      heroTitleHighlight: "sans effort.",
      heroSubtitle:
        "Gérez clients, équipes, sous-traitants et finances — tout en une seule plateforme.",
      startFree: "Commencer gratuitement",
      signInAccount: "Se connecter à votre compte",
      dataOwnership: "Propriété des données",
      projectsSupported: "Projets supportés",
      available: "Disponible",
      featuresTitle: "Tout ce dont vous avez besoin, rien de plus",
      featuresSubtitle:
        "Orkestria est conçu pour les organisations qui gèrent des écosystèmes de projets complexes.",
      ctaTitle: "Prêt à prendre le contrôle ?",
      ctaSubtitle:
        "Créez votre compte en quelques secondes et commencez à orchestrer vos projets dès aujourd'hui.",
      ctaButton: "Créer un compte gratuit →",
      features: {
        orchestration: {
          title: "Orchestration de projets",
          description:
            "Centralisez tous vos projets en un seul endroit. Suivez la progression, les délais et les budgets avec une visibilité totale.",
        },
        team: {
          title: "Équipe & personnel",
          description:
            "Gérez les employés, sous-traitants et rôles dans plusieurs entreprises avec un contrôle d'accès granulaire.",
        },
        multiTenant: {
          title: "Entreprises multi-locataires",
          description:
            "Chaque organisation dispose de son propre espace sécurisé. Isolation des données et permissions par rôle par défaut.",
        },
        secure: {
          title: "Sécurisé par conception",
          description:
            "Authentification JWT, données chiffrées et journaux prêts pour l'audit. Conçu pour la conformité dès le premier jour.",
        },
      },
    },
    authTagline: "Orchestrez vos projets, sans effort.",
    authSubtitle:
      "Gérez clients, équipes, sous-traitants et finances — tout en une seule plateforme.",
    login: {
      title: "Bienvenue",
      subtitle: "Connectez-vous à votre espace Orkestria",
      emailLabel: "Adresse e-mail",
      emailPlaceholder: "vous@entreprise.com",
      passwordLabel: "Mot de passe",
      submitLoading: "Connexion en cours…",
      submit: "Se connecter",
      noAccount: "Pas encore de compte ?",
      createOne: "En créer un",
      forgotPassword: "Mot de passe oublié ?",
      successMessage: "Compte créé avec succès — connectez-vous pour continuer.",
      verifiedMessage: "E-mail vérifié ! Vous pouvez maintenant vous connecter.",
      verifyErrorMessage: "Le lien de vérification est invalide ou a expiré. Veuillez vous réinscrire.",
      passwordResetMessage: "Mot de passe réinitialisé avec succès. Connectez-vous.",
      invalidCredentials: "Identifiants invalides. Veuillez réessayer.",
      emailNotVerified: "Veuillez vérifier votre adresse e-mail avant de vous connecter.",
      invalidEmail: "Adresse e-mail invalide",
      passwordRequired: "Le mot de passe est requis",
    },
    forgotPassword: {
      title: "Mot de passe oublié",
      subtitle: "Entrez votre adresse e-mail pour recevoir un lien de réinitialisation",
      emailLabel: "Adresse e-mail",
      emailPlaceholder: "vous@entreprise.com",
      submit: "Envoyer le lien",
      submitLoading: "Envoi en cours…",
      backToLogin: "Retour à la connexion",
      successTitle: "Vérifiez votre boîte mail",
      successBody: "Si un compte existe pour cette adresse e-mail, vous recevrez un lien de réinitialisation dans quelques instants.",
      successSpam: "Pensez à vérifier vos spams si vous ne le trouvez pas.",
      invalidEmail: "Adresse e-mail invalide",
      failed: "Une erreur est survenue. Veuillez réessayer.",
    },
    resetPassword: {
      title: "Nouveau mot de passe",
      subtitle: "Choisissez un nouveau mot de passe pour votre compte",
      passwordLabel: "Nouveau mot de passe",
      confirmPasswordLabel: "Confirmer le mot de passe",
      submit: "Réinitialiser le mot de passe",
      submitLoading: "Réinitialisation…",
      backToLogin: "Retour à la connexion",
      successTitle: "Mot de passe mis à jour",
      successBody: "Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter.",
      passwordMin: "Le mot de passe doit contenir au moins 8 caractères",
      passwordUppercase: "Doit contenir au moins une lettre majuscule",
      passwordNumber: "Doit contenir au moins un chiffre",
      confirmPasswordRequired: "Veuillez confirmer votre mot de passe",
      passwordsMismatch: "Les mots de passe ne correspondent pas",
      invalidToken: "Ce lien de réinitialisation est invalide ou a expiré.",
      failed: "Une erreur est survenue. Veuillez réessayer.",
    },
    register: {
      title: "Créer votre compte",
      subtitle: "Commencez à gérer vos projets dès aujourd'hui",
      firstNameLabel: "Prénom",
      lastNameLabel: "Nom",
      emailLabel: "Adresse e-mail",
      emailPlaceholder: "vous@entreprise.com",
      passwordLabel: "Mot de passe",
      passwordPlaceholder: "Min. 8 car., 1 majuscule, 1 chiffre",
      confirmPasswordLabel: "Confirmer le mot de passe",
      submitLoading: "Création en cours…",
      submit: "Créer un compte",
      alreadyAccount: "Déjà un compte ?",
      signIn: "Se connecter",
      registrationFailed: "Échec de l'inscription. Veuillez réessayer.",
      firstNameRequired: "Le prénom est requis",
      lastNameRequired: "Le nom est requis",
      invalidEmail: "Adresse e-mail invalide",
      passwordMin: "Le mot de passe doit contenir au moins 8 caractères",
      passwordUppercase: "Doit contenir au moins une lettre majuscule",
      passwordNumber: "Doit contenir au moins un chiffre",
      confirmPasswordRequired: "Veuillez confirmer votre mot de passe",
      passwordsMismatch: "Les mots de passe ne correspondent pas",
      checkEmailTitle: "Vérifiez votre boîte mail",
      checkEmailSubtitle: "Un e-mail de confirmation a été envoyé",
      checkEmailBody: "Nous avons envoyé un lien de confirmation à votre adresse e-mail. Cliquez sur ce lien pour activer votre compte.",
      checkEmailSpam: "Si vous ne le trouvez pas, pensez à vérifier vos spams.",
    },
    nav: {
      dashboard: "Tableau de bord",
      users: "Utilisateurs",
      companies: "Entreprises",
      clients: "Clients",
      projects: "Projets",
      employees: "Employés",
      profile: "Mon profil",
      roleScopes: "Permissions",
      tickets: "Tickets",
      btpRh: "BTP / RH",
      leavesNav: "Absences",
      kanban: "Kanban projets",
      signOut: "Se déconnecter",
      switchToUserMode: "Mode utilisateur",
      clientView: "Vue client",
      backToAdmin: "Retour à l'admin",
    },
    dashboard: {
      title: "Tableau de bord",
      subtitle: "Vue d'ensemble de votre espace Orkestria",
      totalUsers: "Total utilisateurs",
      activeUsers: "Utilisateurs actifs",
      companies: "Entreprises",
      totalProjects: "Projets",
      recentUsers: "Utilisateurs récents",
      viewAll: "Voir tout",
      noUsers: "Aucun utilisateur trouvé.",
      noCompanies: "Aucune entreprise pour l'instant.",
      loadError:
        "Échec du chargement. Assurez-vous d'avoir les droits d'administration.",
    },
    users: {
      title: "Utilisateurs",
      subtitle: "Tous les utilisateurs inscrits dans votre espace",
      colUser: "Utilisateur",
      colRole: "Rôle",
      colCompany: "Entreprise",
      colStatus: "Statut",
      colJoined: "Inscrit le",
      noUsers: "Aucun utilisateur trouvé.",
      loadError: "Échec du chargement des utilisateurs.",
    },
    userDetail: {
      backLabel: "Utilisateurs",
      id: "ID",
      email: "E-mail",
      firstName: "Prénom",
      lastName: "Nom",
      role: "Rôle",
      company: "Entreprise",
      status: "Statut",
      joined: "Inscrit le",
      loadError: "Échec du chargement de l'utilisateur.",
    },
    companies: {
      title: "Entreprises",
      subtitle: "Toutes les organisations inscrites dans votre espace",
      colCompany: "Entreprise",
      colSlug: "Slug",
      colMembers: "Membres",
      colCreated: "Créée le",
      noCompanies: "Aucune entreprise trouvée.",
      loadError: "Échec du chargement des entreprises.",
    },
    companyDetail: {
      backLabel: "Entreprises",
      companyId: "ID Entreprise",
      slug: "Slug",
      created: "Créée le",
      members: "Membres",
      activeMembers: "Membres actifs",
      membersTitle: "Membres",
      noMembers: "Aucun membre dans cette entreprise pour l'instant.",
      colUser: "Utilisateur",
      colRole: "Rôle",
      colStatus: "Statut",
      loadError: "Échec du chargement de l'entreprise.",
    },
    clients: {
      title: "Clients",
      subtitle: "Contacts rattachés à une entreprise",
      colName: "Nom",
      colEmail: "E-mail",
      colCompany: "Entreprise",
      add: "Ajouter un client",
      newTitle: "Nouveau client",
      loadError: "Impossible de charger les clients.",
      none: "Aucun client.",
      back: "Clients",
    },
    projects: {
      title: "Projets",
      subtitle: "Pipeline et suivi",
      colTitle: "Projet",
      colClient: "Client",
      colPipeline: "Étape",
      colCreated: "Créé le",
      filterSearch: "Rechercher",
      filterPipeline: "Étape",
      allPipelines: "Toutes les étapes",
      add: "Nouveau projet",
      newTitle: "Nouveau projet",
      loadError: "Impossible de charger les projets.",
      none: "Aucun projet.",
      back: "Projets",
      listView: "Vue liste",
    },
    kanban: {
      subtitle: "Glissez les cartes pour changer d'étape",
    },
    projectDetail: {
      dates: "Dates",
      start: "Début",
      end: "Fin",
      pipeline: "Pipeline",
    },
    pipeline: {
      contact:            "Prise de contact",
      meeting:            "Rencontre client",
      engineer_assigned:  "Prise par un ingénieur",
      quote_plan:         "Plan pour devis",
      quote_signed:       "Signature du devis",
      invoice_sent:       "Facture envoyée",
      deposit_received:   "Acompte reçu",
      design_started:     "Début dessin architecte",
      design_completed:   "Fin du dessin",
      client_signed:      "Signature client",
      components_ordered: "Commande des composants",
      construction:       "Montage de la maison",
      subcontractors:     "Intervention sous-traitants",
      site_visit:         "Visite",
      paid:               "Paiement total",
      advanceButton:      "Avancer l'étape",
      advanceTo:          "Avancer vers",
      noPermission:       "Vous n'avez pas les droits pour avancer cette étape.",
      terminal:           "Projet terminé",
      historyTitle:       "Historique des étapes",
      historyEmpty:       "Aucun changement d'étape enregistré.",
      historyFrom:        "De",
      historyTo:          "Vers",
      historyBy:          "Par",
      notePlaceholder:    "Note optionnelle (ex. : réf. devis, remarque)…",
    },
    documents: {
      title: "Documents",
      upload: "Envoyer",
      scope: "Scope",
      file: "Fichier",
      filterScope: "Filtrer par scope",
      allScopes: "Tous les scopes",
      download: "Télécharger",
      none: "Aucun document.",
      loadError: "Impossible de charger les documents.",
      scopeRh: "RH",
      scopeTech: "Tech",
      scopeFinance: "Finance",
      scopeDesign: "Design",
      scopeLegal: "Juridique",
    },
    roleScopes: {
      title: "Accès aux documents par rôle",
      subtitle: "Définissez quels scopes de documents chaque rôle peut consulter. Ces droits s'ajoutent aux droits individuels.",
      save: "Enregistrer les politiques",
      saving: "Enregistrement…",
      saveOk: "Politiques enregistrées.",
      loadError: "Impossible de charger les politiques d'accès.",
      noPolicy: "Aucune politique définie.",
    },
    adminForms: {
      newCompany: "Nouvelle entreprise",
      editCompany: "Modifier l'entreprise",
      companyName: "Nom",
      companySlug: "Slug (lettres minuscules, chiffres, tirets)",
      save: "Enregistrer",
      saving: "Enregistrement…",
      newUser: "Nouvel utilisateur",
      password: "Mot de passe initial",
      rolesLabel: "Rôles",
      companyAssignment: "Entreprise",
      noCompanyOption: "Aucune entreprise",
      adminSettings: "Paramètres administrateur",
      saveUser: "Mettre à jour l'utilisateur",
      createUser: "Créer l'utilisateur",
      addCompany: "Ajouter une entreprise",
      edit: "Modifier",
      addUser: "Ajouter un utilisateur",
      genericError: "Une erreur est survenue.",
      changesSaved: "Modifications enregistrées.",
      documentAccess: "Accès aux documents par scope",
      selectRolePlaceholder: "Sélectionner un rôle",
    },
    spaces: {
      clientTitle: "Espace client",
      clientBody:
        "Votre espace dédié arrive avec la phase projets et facturation. Revenez bientôt.",
      subcontractorTitle: "Espace sous-traitant",
      subcontractorBody:
        "L'accès aux projets assignés et aux livrables sera disponible prochainement.",
    },
    employees: {
      title: "Employés",
      subtitle: "Membres de l'équipe et sous-traitants",
      add: "Ajouter un employé",
      newTitle: "Nouvel employé",
      colName: "Nom",
      colRole: "Rôle",
      colCompany: "Entreprise",
      colRate: "Taux journalier",
      colSkills: "Compétences",
      none: "Aucun employé.",
      loadError: "Impossible de charger les employés.",
      back: "Employés",
      firstName: "Prénom",
      lastName: "Nom",
      role: "Rôle / Poste",
      skills: "Compétences (séparées par virgule)",
      skillsPlaceholder: "React, TypeScript, Node.js…",
      dailyRate: "Taux journalier (€)",
      linkedUser: "Compte utilisateur lié",
      save: "Enregistrer",
      saving: "Enregistrement…",
    },
    tasks: {
      title: "Tâches",
      add: "Ajouter une tâche",
      none: "Aucune tâche.",
      loadError: "Impossible de charger les tâches.",
      titleLabel: "Titre",
      description: "Description",
      status: "Statut",
      dueDate: "Échéance",
      assignee: "Assigné à",
      noAssignee: "Non assigné",
      statusOpen: "Ouvert",
      statusInProgress: "En cours",
      statusDone: "Terminé",
      save: "Enregistrer",
      saving: "Enregistrement…",
      delete: "Supprimer",
    },
    tickets: {
      title: "Tickets",
      subtitle: "Suivi des bugs, demandes et incidents",
      add: "Nouveau ticket",
      new: "Nouveau",
      none: "Aucun ticket.",
      loadError: "Impossible de charger les tickets.",
      titleLabel: "Titre",
      description: "Description",
      status: "Statut",
      priority: "Priorité",
      type: "Type",
      source: "Source",
      project: "Projet",
      noProject: "Sans projet",
      assignee: "Assigné à",
      noAssignee: "Non assigné",
      reporter: "Rapporté par",
      createdAt: "Créé le",
      updatedAt: "Mis à jour le",
      filters: "Filtres",
      search: "Rechercher…",
      all: "Tous",
      boardView: "Vue tableau",
      listView: "Vue liste",
      searchPlaceholder: "Rechercher…",
      allPriorities: "Toutes priorités",
      allTypes: "Tous types",
      clearFilters: "Effacer filtres",
      save: "Enregistrer",
      saving: "Enregistrement…",
      cancel: "Annuler",
      delete: "Supprimer",
      confirmDelete: "Supprimer ce ticket ?",
      comments: "Commentaires",
      addComment: "Ajouter un commentaire",
      commentPlaceholder: "Votre commentaire…",
      sendComment: "Envoyer",
      sending: "Envoi…",
      backToList: "Retour à la liste",
      slaTitle: "SLA & Délais",
      slaCreated: "Créé le",
      slaFirstResponse: "Première réponse",
      slaResolved: "Résolu",
      slaStatus: "Statut actuel",
      slaMinutes: "min",
      slaPending: "En attente",
      statusOpen: "Ouvert",
      statusInProgress: "En cours",
      statusInReview: "En relecture",
      statusDone: "Terminé",
      statusClosed: "Clôturé",
      priorityLow: "Basse",
      priorityNormal: "Normale",
      priorityHigh: "Haute",
      priorityUrgent: "Urgente",
      typeBug: "Bug",
      typeFeature: "Fonctionnalité",
      typeTask: "Tâche",
      typeSupport: "Support",
      typeIncident: "Incident",
      sourceInternal: "Interne",
      sourceClient: "Client",
      clientSection: {
        title: "Support",
        subtitle: "Ouvrez un ticket si vous rencontrez un problème.",
        open: "Ouvrir un ticket",
        noTickets: "Aucun ticket pour le moment.",
      },
      devSpace: {
        title: "Espace dev",
        subtitle: "Tickets internes et demandes clients à traiter",
        myAssigned: "Mes tickets actifs",
        noAssigned: "Aucun ticket assigné.",
        urgentUnanswered: "Urgents sans réponse",
        waitingSince: "En attente depuis",
        noResponseFor: "Sans réponse depuis",
        recentlyResolved: "Résolutions récentes",
        resolvedIn: "résolu en",
      },
    },
    timeTracking: {
      title: "Suivi du temps",
      add: "Ajouter une entrée",
      none: "Aucune entrée de temps.",
      employee: "Employé",
      hours: "Heures",
      date: "Date",
      description: "Description",
      hourType: "Type d'heure",
      hourTypeRegular: "Standard",
      hourTypeNight: "Nuit",
      hourTypeWeekend: "Week-end",
      hourTypeTravel: "Déplacement",
      hourTypeOnCall: "Astreinte",
      save: "Enregistrer",
      saving: "Enregistrement…",
      totalHours: "Total heures",
      delete: "Supprimer",
    },
    quotes: {
      title: "Devis",
      add: "Nouveau devis",
      none: "Aucun devis.",
      loadError: "Impossible de charger les devis.",
      newTitle: "Nouveau devis",
      back: "Devis",
      label: "Désignation",
      quantity: "Quantité",
      unitPrice: "P.U. (€)",
      total: "Total",
      addLine: "Ajouter une ligne",
      removeLine: "Supprimer",
      notes: "Notes",
      statusDraft: "Brouillon",
      statusSent: "Envoyé",
      statusAccepted: "Accepté",
      statusRejected: "Rejeté",
      send: "Marquer comme envoyé",
      accept: "Accepter",
      reject: "Rejeter",
      viewPdf: "Voir PDF",
      grandTotal: "Total HT",
      save: "Enregistrer",
      saving: "Enregistrement…",
      deleteConfirm: "Supprimer ce devis ?",
    },
    invoices: {
      title: "Factures",
      none: "Aucune facture.",
      loadError: "Impossible de charger les factures.",
      statusDraft: "Brouillon",
      statusSent: "Envoyée",
      statusPaid: "Payée",
      markPaid: "Marquer comme payée",
      viewPdf: "Voir PDF",
      total: "Montant HT",
      paidAt: "Payée le",
    },
    classification: {
      pending: "Classification en cours…",
      done: "Classifié",
      error: "Erreur de classification",
      label: "Classification",
      editLabel: "Modifier la classification",
      save: "Sauvegarder",
    },
    subcontractor: {
      projectsTitle: "Mes projets",
      projectsSubtitle: "Projets auxquels vous êtes assigné",
      noProjects: "Aucun projet assigné.",
      loadError: "Impossible de charger vos projets.",
      myTasks: "Mes tâches",
      markDone: "Marquer comme terminé",
    },
    clientSpace: {
      projectsTitle: "Mes projets",
      projectsSubtitle: "Suivez l'avancement de vos projets",
      noProjects: "Aucun projet.",
      loadError: "Impossible de charger vos projets.",
      quotesTitle: "Devis",
      invoicesTitle: "Factures",
    },
    btpRh: {
      title: "Pilotage BTP & RH",
      subtitle:
        "Indicateurs dirigeant, export des temps pour la paie et échéances conformité (habilitations, assurances…).",
      kpisTitle: "Indicateurs",
      acceptedQuotes: "Montant devis acceptés",
      hoursLast30Days: "Heures saisies (30 jours)",
      complianceDue30Days: "Échéances sous 30 jours",
      projectsByStage: "Projets par étape de pipeline",
      payrollTitle: "Export paie (CSV)",
      from: "Du",
      to: "Au",
      companyFilter: "Entreprise",
      allCompanies: "Toutes",
      downloadCsv: "Télécharger le CSV",
      downloading: "Préparation…",
      deadlinesTitle: "Échéances conformité",
      addDeadline: "Ajouter une échéance",
      titleLabel: "Libellé",
      categoryLabel: "Catégorie",
      expiresLabel: "Date d'expiration",
      notesLabel: "Notes",
      companyLabel: "Entreprise",
      optionalEmployeeId: "ID employé (optionnel)",
      optionalProjectId: "ID projet (optionnel)",
      save: "Enregistrer",
      saving: "Enregistrement…",
      delete: "Supprimer",
      confirmDelete: "Supprimer cette échéance ?",
      loadError: "Impossible de charger les données BTP/RH.",
      noDeadlines: "Aucune échéance enregistrée.",
      categoryCertification: "Habilitation / formation",
      categoryInsurance: "Assurance / attestation",
      categoryMedical: "Visite médicale",
      categoryOther: "Autre",
      filterUpcoming: "Limiter aux échéances des 90 prochains jours",
      editDeadline: "Modifier",
      cancelEdit: "Annuler",
      updateDeadline: "Mettre à jour",
      updating: "Mise à jour…",
      actualLaborCost: "Coût MO réel (all time)",
      margin: "Marge CA − coût MO",
      pendingLeaves: "Congés en attente",
    },
    leaves: {
      title: "Absences & Congés",
      subtitle: "Gestion des demandes d'absence : congés payés, RTT, maladie, formations.",
      addLeave: "Ajouter une absence",
      noLeaves: "Aucune absence enregistrée.",
      loadError: "Impossible de charger les absences.",
      employeeLabel: "Employé",
      typeLabel: "Type",
      statusLabel: "Statut",
      startsLabel: "Date de début",
      endsLabel: "Date de fin",
      reasonLabel: "Motif",
      save: "Enregistrer",
      saving: "Enregistrement…",
      approve: "Approuver",
      approving: "Approbation…",
      reject: "Refuser",
      rejecting: "Refus…",
      delete: "Supprimer",
      confirmDelete: "Supprimer cette absence ?",
      confirmApprove: "Approuver cette demande d'absence ?",
      confirmReject: "Refuser cette demande d'absence ?",
      filterStatus: "Statut",
      filterType: "Type",
      allStatuses: "Tous les statuts",
      allTypes: "Tous les types",
      workingDays: "jours ouvrés",
      approvedBy: "Traité par",
      approvedAt: "Le",
      typePaidVacation: "Congés payés",
      typeRtt: "RTT",
      typeSick: "Arrêt maladie",
      typeTraining: "Formation",
      typeOther: "Autre",
      statusPending: "En attente",
      statusApproved: "Approuvé",
      statusRejected: "Refusé",
      statusCancelled: "Annulé",
      allCompanies: "Toutes les entreprises",
      allEmployees: "Tous les employés",
      viewList: "Liste",
      viewCalendar: "Calendrier",
    },
  },

  en: {
    signIn: "Sign in",
    signOut: "Sign out",
    registerLink: "Register",
    getStarted: "Get started",
    viewAll: "View all",
    view: "View →",
    admin: "Admin",
    user: "User",
    active: "Active",
    inactive: "Inactive",
    noCompany: "No company",
    home: {
      heroTitle: "Orchestrate your projects,",
      heroTitleHighlight: "effortlessly.",
      heroSubtitle:
        "Manage clients, teams, subcontractors and financials — all in one platform.",
      startFree: "Start for free",
      signInAccount: "Sign in to your account",
      dataOwnership: "Data ownership",
      projectsSupported: "Projects supported",
      available: "Available",
      featuresTitle: "Everything you need, nothing you don't",
      featuresSubtitle:
        "Orkestria is purpose-built for organisations that manage complex project ecosystems.",
      ctaTitle: "Ready to take control?",
      ctaSubtitle:
        "Create your account in seconds and start orchestrating your projects today.",
      ctaButton: "Create a free account →",
      features: {
        orchestration: {
          title: "Project orchestration",
          description:
            "Centralise all your projects in one place. Track progress, deadlines, and budgets with full visibility.",
        },
        team: {
          title: "Team & workforce",
          description:
            "Manage employees, subcontractors, and roles across multiple companies with granular access control.",
        },
        multiTenant: {
          title: "Multi-tenant companies",
          description:
            "Each organisation gets its own secure workspace. Data isolation and role-based permissions by default.",
        },
        secure: {
          title: "Secure by design",
          description:
            "JWT authentication, encrypted data, and audit-ready logs. Built for compliance from day one.",
        },
      },
    },
    authTagline: "Orchestrate your projects, effortlessly.",
    authSubtitle:
      "Manage clients, teams, subcontractors and financials — all in one platform.",
    login: {
      title: "Welcome back",
      subtitle: "Sign in to your Orkestria account",
      emailLabel: "Email address",
      emailPlaceholder: "you@company.com",
      passwordLabel: "Password",
      submitLoading: "Signing in…",
      submit: "Sign in",
      noAccount: "No account yet?",
      createOne: "Create one",
      forgotPassword: "Forgot password?",
      successMessage: "Account created successfully — sign in to continue.",
      verifiedMessage: "Email verified! You can now sign in.",
      verifyErrorMessage: "The verification link is invalid or has expired. Please register again.",
      passwordResetMessage: "Password reset successfully. You can now sign in.",
      invalidCredentials: "Invalid credentials. Please try again.",
      emailNotVerified: "Please verify your email address before signing in.",
      invalidEmail: "Invalid email address",
      passwordRequired: "Password is required",
    },
    forgotPassword: {
      title: "Forgot your password?",
      subtitle: "Enter your email address to receive a reset link",
      emailLabel: "Email address",
      emailPlaceholder: "you@company.com",
      submit: "Send reset link",
      submitLoading: "Sending…",
      backToLogin: "Back to sign in",
      successTitle: "Check your inbox",
      successBody: "If an account exists for that email address, you will receive a password reset link shortly.",
      successSpam: "Can't find it? Check your spam folder.",
      invalidEmail: "Invalid email address",
      failed: "Something went wrong. Please try again.",
    },
    resetPassword: {
      title: "Set new password",
      subtitle: "Choose a new password for your account",
      passwordLabel: "New password",
      confirmPasswordLabel: "Confirm password",
      submit: "Reset password",
      submitLoading: "Resetting…",
      backToLogin: "Back to sign in",
      successTitle: "Password updated",
      successBody: "Your password has been reset successfully. You can now sign in.",
      passwordMin: "Password must be at least 8 characters",
      passwordUppercase: "Must contain at least one uppercase letter",
      passwordNumber: "Must contain at least one number",
      confirmPasswordRequired: "Please confirm your password",
      passwordsMismatch: "Passwords do not match",
      invalidToken: "This reset link is invalid or has expired.",
      failed: "Something went wrong. Please try again.",
    },
    register: {
      title: "Create your account",
      subtitle: "Start managing your projects today",
      firstNameLabel: "First name",
      lastNameLabel: "Last name",
      emailLabel: "Email address",
      emailPlaceholder: "you@company.com",
      passwordLabel: "Password",
      passwordPlaceholder: "Min. 8 chars, 1 uppercase, 1 number",
      confirmPasswordLabel: "Confirm password",
      submitLoading: "Creating account…",
      submit: "Create account",
      alreadyAccount: "Already have an account?",
      signIn: "Sign in",
      registrationFailed: "Registration failed. Please try again.",
      firstNameRequired: "First name is required",
      lastNameRequired: "Last name is required",
      invalidEmail: "Invalid email address",
      passwordMin: "Password must be at least 8 characters",
      passwordUppercase: "Must contain at least one uppercase letter",
      passwordNumber: "Must contain at least one number",
      confirmPasswordRequired: "Please confirm your password",
      passwordsMismatch: "Passwords do not match",
      checkEmailTitle: "Check your inbox",
      checkEmailSubtitle: "A confirmation email has been sent",
      checkEmailBody: "We sent a confirmation link to your email address. Click that link to activate your account.",
      checkEmailSpam: "Can't find it? Check your spam folder.",
    },
    nav: {
      dashboard: "Dashboard",
      users: "Users",
      companies: "Companies",
      clients: "Clients",
      projects: "Projects",
      employees: "Employees",
      profile: "My profile",
      roleScopes: "Permissions",
      tickets: "Tickets",
      btpRh: "Construction / HR",
      leavesNav: "Absences",
      kanban: "Projects Kanban",
      signOut: "Sign out",
      switchToUserMode: "User mode",
      clientView: "Client view",
      backToAdmin: "Back to admin",
    },
    dashboard: {
      title: "Dashboard",
      subtitle: "Overview of your Orkestria workspace",
      totalUsers: "Total Users",
      activeUsers: "Active Users",
      companies: "Companies",
      totalProjects: "Projects",
      recentUsers: "Recent Users",
      viewAll: "View all",
      noUsers: "No users found.",
      noCompanies: "No companies yet.",
      loadError:
        "Failed to load dashboard data. Make sure you have admin privileges.",
    },
    users: {
      title: "Users",
      subtitle: "All registered users in your workspace",
      colUser: "User",
      colRole: "Role",
      colCompany: "Company",
      colStatus: "Status",
      colJoined: "Joined",
      noUsers: "No users found.",
      loadError: "Failed to load users.",
    },
    userDetail: {
      backLabel: "Users",
      id: "ID",
      email: "Email",
      firstName: "First name",
      lastName: "Last name",
      role: "Role",
      company: "Company",
      status: "Status",
      joined: "Joined",
      loadError: "Failed to load user.",
    },
    companies: {
      title: "Companies",
      subtitle: "All organisations registered in your workspace",
      colCompany: "Company",
      colSlug: "Slug",
      colMembers: "Members",
      colCreated: "Created",
      noCompanies: "No companies found.",
      loadError: "Failed to load companies.",
    },
    companyDetail: {
      backLabel: "Companies",
      companyId: "Company ID",
      slug: "Slug",
      created: "Created",
      members: "Members",
      activeMembers: "Active members",
      membersTitle: "Members",
      noMembers: "No members in this company yet.",
      colUser: "User",
      colRole: "Role",
      colStatus: "Status",
      loadError: "Failed to load company.",
    },
    clients: {
      title: "Clients",
      subtitle: "Contacts linked to a company",
      colName: "Name",
      colEmail: "Email",
      colCompany: "Company",
      add: "Add client",
      newTitle: "New client",
      loadError: "Failed to load clients.",
      none: "No clients yet.",
      back: "Clients",
    },
    projects: {
      title: "Projects",
      subtitle: "Pipeline and tracking",
      colTitle: "Project",
      colClient: "Client",
      colPipeline: "Stage",
      colCreated: "Created",
      filterSearch: "Search",
      filterPipeline: "Stage",
      allPipelines: "All stages",
      add: "New project",
      newTitle: "New project",
      loadError: "Failed to load projects.",
      none: "No projects yet.",
      back: "Projects",
      listView: "List view",
    },
    kanban: {
      subtitle: "Drag cards to change stages",
    },
    projectDetail: {
      dates: "Dates",
      start: "Start",
      end: "End",
      pipeline: "Pipeline",
    },
    pipeline: {
      contact:            "Initial Contact",
      meeting:            "Client Meeting",
      engineer_assigned:  "Engineer Assigned",
      quote_plan:         "Quote Plan",
      quote_signed:       "Quote Signed",
      invoice_sent:       "Invoice Sent",
      deposit_received:   "Deposit Received",
      design_started:     "Architect Design Started",
      design_completed:   "Design Completed",
      client_signed:      "Client Signature",
      components_ordered: "Components Ordered",
      construction:       "Construction",
      subcontractors:     "Subcontractor Works",
      site_visit:         "Site Visit",
      paid:               "Final Payment",
      advanceButton:      "Advance Stage",
      advanceTo:          "Advance to",
      noPermission:       "You do not have permission to advance this stage.",
      terminal:           "Project complete",
      historyTitle:       "Stage History",
      historyEmpty:       "No stage changes recorded yet.",
      historyFrom:        "From",
      historyTo:          "To",
      historyBy:          "By",
      notePlaceholder:    "Optional note (e.g. quote ref., remark)…",
    },
    documents: {
      title: "Documents",
      upload: "Upload",
      scope: "Scope",
      file: "File",
      filterScope: "Filter by scope",
      allScopes: "All scopes",
      download: "Download",
      none: "No documents yet.",
      loadError: "Failed to load documents.",
      scopeRh: "HR",
      scopeTech: "Tech",
      scopeFinance: "Finance",
      scopeDesign: "Design",
      scopeLegal: "Legal",
    },
    roleScopes: {
      title: "Document access by role",
      subtitle: "Define which document scopes each role can view. These permissions are additive to individual user scopes.",
      save: "Save policies",
      saving: "Saving…",
      saveOk: "Policies saved.",
      loadError: "Failed to load access policies.",
      noPolicy: "No policy defined.",
    },
    adminForms: {
      newCompany: "New company",
      editCompany: "Edit company",
      companyName: "Name",
      companySlug: "Slug (lowercase letters, numbers, hyphens)",
      save: "Save",
      saving: "Saving…",
      newUser: "New user",
      password: "Initial password",
      rolesLabel: "Roles",
      companyAssignment: "Company",
      noCompanyOption: "No company",
      adminSettings: "Administrator settings",
      saveUser: "Update user",
      createUser: "Create user",
      addCompany: "Add company",
      edit: "Edit",
      addUser: "Add user",
      genericError: "Something went wrong.",
      changesSaved: "Changes saved.",
      documentAccess: "Document access by scope",
      selectRolePlaceholder: "Select a role",
    },
    spaces: {
      clientTitle: "Client area",
      clientBody:
        "Your dedicated space will arrive with projects and billing. Check back soon.",
      subcontractorTitle: "Subcontractor area",
      subcontractorBody:
        "Access to assigned projects and deliverables will be available in an upcoming release.",
    },
    employees: {
      title: "Employees",
      subtitle: "Team members and subcontractors",
      add: "Add employee",
      newTitle: "New employee",
      colName: "Name",
      colRole: "Role",
      colCompany: "Company",
      colRate: "Daily rate",
      colSkills: "Skills",
      none: "No employees yet.",
      loadError: "Failed to load employees.",
      back: "Employees",
      firstName: "First name",
      lastName: "Last name",
      role: "Role / Position",
      skills: "Skills (comma-separated)",
      skillsPlaceholder: "React, TypeScript, Node.js…",
      dailyRate: "Daily rate (€)",
      linkedUser: "Linked user account",
      save: "Save",
      saving: "Saving…",
    },
    tasks: {
      title: "Tasks",
      add: "Add task",
      none: "No tasks yet.",
      loadError: "Failed to load tasks.",
      titleLabel: "Title",
      description: "Description",
      status: "Status",
      dueDate: "Due date",
      assignee: "Assignee",
      noAssignee: "Unassigned",
      statusOpen: "Open",
      statusInProgress: "In progress",
      statusDone: "Done",
      save: "Save",
      saving: "Saving…",
      delete: "Delete",
    },
    tickets: {
      title: "Tickets",
      subtitle: "Track bugs, requests and incidents",
      add: "New ticket",
      new: "New",
      none: "No tickets.",
      loadError: "Failed to load tickets.",
      titleLabel: "Title",
      description: "Description",
      status: "Status",
      priority: "Priority",
      type: "Type",
      source: "Source",
      project: "Project",
      noProject: "No project",
      assignee: "Assignee",
      noAssignee: "Unassigned",
      reporter: "Reported by",
      createdAt: "Created at",
      updatedAt: "Updated at",
      filters: "Filters",
      search: "Search…",
      all: "All",
      boardView: "Board view",
      listView: "List view",
      searchPlaceholder: "Search…",
      allPriorities: "All priorities",
      allTypes: "All types",
      clearFilters: "Clear filters",
      save: "Save",
      saving: "Saving…",
      cancel: "Cancel",
      delete: "Delete",
      confirmDelete: "Delete this ticket?",
      comments: "Comments",
      addComment: "Add a comment",
      commentPlaceholder: "Your comment…",
      sendComment: "Send",
      sending: "Sending…",
      backToList: "Back to list",
      slaTitle: "SLA & Timelines",
      slaCreated: "Created",
      slaFirstResponse: "First response",
      slaResolved: "Resolved",
      slaStatus: "Current status",
      slaMinutes: "min",
      slaPending: "Awaiting",
      statusOpen: "Open",
      statusInProgress: "In progress",
      statusInReview: "In review",
      statusDone: "Done",
      statusClosed: "Closed",
      priorityLow: "Low",
      priorityNormal: "Normal",
      priorityHigh: "High",
      priorityUrgent: "Urgent",
      typeBug: "Bug",
      typeFeature: "Feature",
      typeTask: "Task",
      typeSupport: "Support",
      typeIncident: "Incident",
      sourceInternal: "Internal",
      sourceClient: "Client",
      clientSection: {
        title: "Support",
        subtitle: "Open a ticket if you have an issue.",
        open: "Open a ticket",
        noTickets: "No tickets yet.",
      },
      devSpace: {
        title: "Dev space",
        subtitle: "Internal tickets and client requests to handle",
        myAssigned: "My active tickets",
        noAssigned: "No assigned tickets.",
        urgentUnanswered: "Urgent without response",
        waitingSince: "Waiting since",
        noResponseFor: "No response for",
        recentlyResolved: "Recently resolved",
        resolvedIn: "resolved in",
      },
    },
    timeTracking: {
      title: "Time tracking",
      add: "Add entry",
      none: "No time entries yet.",
      employee: "Employee",
      hours: "Hours",
      date: "Date",
      description: "Description",
      hourType: "Hour type",
      hourTypeRegular: "Regular",
      hourTypeNight: "Night",
      hourTypeWeekend: "Weekend",
      hourTypeTravel: "Travel",
      hourTypeOnCall: "On-call",
      save: "Save",
      saving: "Saving…",
      totalHours: "Total hours",
      delete: "Delete",
    },
    quotes: {
      title: "Quotes",
      add: "New quote",
      none: "No quotes yet.",
      loadError: "Failed to load quotes.",
      newTitle: "New quote",
      back: "Quotes",
      label: "Description",
      quantity: "Qty",
      unitPrice: "Unit price (€)",
      total: "Total",
      addLine: "Add line",
      removeLine: "Remove",
      notes: "Notes",
      statusDraft: "Draft",
      statusSent: "Sent",
      statusAccepted: "Accepted",
      statusRejected: "Rejected",
      send: "Mark as sent",
      accept: "Accept",
      reject: "Reject",
      viewPdf: "View PDF",
      grandTotal: "Total (excl. tax)",
      save: "Save",
      saving: "Saving…",
      deleteConfirm: "Delete this quote?",
    },
    invoices: {
      title: "Invoices",
      none: "No invoices yet.",
      loadError: "Failed to load invoices.",
      statusDraft: "Draft",
      statusSent: "Sent",
      statusPaid: "Paid",
      markPaid: "Mark as paid",
      viewPdf: "View PDF",
      total: "Amount (excl. tax)",
      paidAt: "Paid on",
    },
    classification: {
      pending: "Classification in progress…",
      done: "Classified",
      error: "Classification error",
      label: "Classification",
      editLabel: "Edit classification",
      save: "Save",
    },
    subcontractor: {
      projectsTitle: "My projects",
      projectsSubtitle: "Projects you are assigned to",
      noProjects: "No assigned projects.",
      loadError: "Failed to load your projects.",
      myTasks: "My tasks",
      markDone: "Mark as done",
    },
    clientSpace: {
      projectsTitle: "My projects",
      projectsSubtitle: "Track the progress of your projects",
      noProjects: "No projects yet.",
      loadError: "Failed to load your projects.",
      quotesTitle: "Quotes",
      invoicesTitle: "Invoices",
    },
    btpRh: {
      title: "Construction & HR",
      subtitle: "Executive KPIs, payroll time export, and compliance deadlines (certifications, insurance, etc.).",
      kpisTitle: "Key indicators",
      acceptedQuotes: "Accepted quotes total",
      hoursLast30Days: "Hours logged (last 30 days)",
      complianceDue30Days: "Deadlines due within 30 days",
      projectsByStage: "Projects by pipeline stage",
      payrollTitle: "Payroll export (CSV)",
      from: "From",
      to: "To",
      companyFilter: "Company",
      allCompanies: "All",
      downloadCsv: "Download CSV",
      downloading: "Preparing…",
      deadlinesTitle: "Compliance deadlines",
      addDeadline: "Add deadline",
      titleLabel: "Title",
      categoryLabel: "Category",
      expiresLabel: "Expiry date",
      notesLabel: "Notes",
      companyLabel: "Company",
      optionalEmployeeId: "Employee ID (optional)",
      optionalProjectId: "Project ID (optional)",
      save: "Save",
      saving: "Saving…",
      delete: "Delete",
      confirmDelete: "Delete this deadline?",
      loadError: "Failed to load construction/HR data.",
      noDeadlines: "No deadlines yet.",
      categoryCertification: "Certification / training",
      categoryInsurance: "Insurance / certificate",
      categoryMedical: "Medical visit",
      categoryOther: "Other",
      filterUpcoming: "Limit to deadlines in the next 90 days",
      editDeadline: "Edit",
      cancelEdit: "Cancel",
      updateDeadline: "Update",
      updating: "Updating…",
      actualLaborCost: "Actual labor cost (all time)",
      margin: "Margin (revenue − labor cost)",
      pendingLeaves: "Pending leave requests",
    },
    leaves: {
      title: "Leaves & Absences",
      subtitle: "Manage absence requests: paid vacation, RTT, sick leave, training.",
      addLeave: "Add absence",
      noLeaves: "No absences recorded.",
      loadError: "Failed to load absences.",
      employeeLabel: "Employee",
      typeLabel: "Type",
      statusLabel: "Status",
      startsLabel: "Start date",
      endsLabel: "End date",
      reasonLabel: "Reason",
      save: "Save",
      saving: "Saving…",
      approve: "Approve",
      approving: "Approving…",
      reject: "Reject",
      rejecting: "Rejecting…",
      delete: "Delete",
      confirmDelete: "Delete this absence?",
      confirmApprove: "Approve this absence request?",
      confirmReject: "Reject this absence request?",
      filterStatus: "Status",
      filterType: "Type",
      allStatuses: "All statuses",
      allTypes: "All types",
      workingDays: "working days",
      approvedBy: "Processed by",
      approvedAt: "On",
      typePaidVacation: "Paid vacation",
      typeRtt: "RTT",
      typeSick: "Sick leave",
      typeTraining: "Training",
      typeOther: "Other",
      statusPending: "Pending",
      statusApproved: "Approved",
      statusRejected: "Rejected",
      statusCancelled: "Cancelled",
      allCompanies: "All companies",
      allEmployees: "All employees",
      viewList: "List",
      viewCalendar: "Calendar",
    },
  },
};
