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
    badge: string;
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
  authBadge: string;
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
    signOut: string;
  };
  dashboard: {
    title: string;
    subtitle: string;
    totalUsers: string;
    activeUsers: string;
    companies: string;
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
      badge: "Sécurisé · Multi-locataire · Basé sur les rôles",
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
    authBadge: "Sécurisé • Multi-locataire • Basé sur les rôles",
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
      profile: "Mon profil",
      signOut: "Se déconnecter",
    },
    dashboard: {
      title: "Tableau de bord",
      subtitle: "Vue d'ensemble de votre espace Orkestria",
      totalUsers: "Total utilisateurs",
      activeUsers: "Utilisateurs actifs",
      companies: "Entreprises",
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
      badge: "Secure · Multi-tenant · Role-based",
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
    authBadge: "Secure • Multi-tenant • Role-based",
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
      profile: "My profile",
      signOut: "Sign out",
    },
    dashboard: {
      title: "Dashboard",
      subtitle: "Overview of your Orkestria workspace",
      totalUsers: "Total Users",
      activeUsers: "Active Users",
      companies: "Companies",
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
  },
};
