type SidebarLink = {
  imgURL: string;
  route: string;
  label: string;
};

export const sidebarLinks: SidebarLink[] = [
  {
    imgURL: '/assets/icons/home.svg',
    route: '/',
    label: 'Home',
  },
  {
    imgURL: '/assets/icons/question.svg',
    route: '/ask-question',
    label: 'Ask a question',
  },
  {
    imgURL: '/assets/icons/tag.svg',
    route: '/tags',
    label: 'Engineering Software',
  },
  {
    imgURL: '/assets/icons/users.svg',
    route: '/community',
    label: 'user',
  },

  // {
  //   imgURL: '/assets/icons/suitcase.svg',
  //   route: '/jobs',
  //   label: 'Find Jobs',
  // },

  {
    imgURL: '/assets/icons/star.svg',
    route: '/collection',
    label: 'Collections',
  },
  {
    imgURL: '/assets/icons/user.svg',
    route: '/profile',
    label: 'Profile',
  },
];
