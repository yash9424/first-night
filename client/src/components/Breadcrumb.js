import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Breadcrumb as BSBreadcrumb } from 'react-bootstrap';

const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x) ;

  // Custom titles for routes
  const getTitleFromPath = (path) => {
    const titles = {
      'admin': 'Admin Panel',
      'users': 'Users Management',
      'products': 'Products Management',
      'orders': 'Orders Management',
      'dashboard': 'Dashboard',
      'contacts': 'Contact Messages',
      'mens-bracelet': "Men's Bracelets",
      'womenbracelet': "Women's Bracelets",
      'menssilverkada': 'Silver Kada',
      'mensblackada': 'Black Kada',
      'stonebracelet': 'Stone Bracelets',
      'divine-collection': 'Divine Collection'
    };
    return titles[path] || path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <BSBreadcrumb className="my-3">
      <BSBreadcrumb.Item linkAs={Link} linkProps={{ to: '/' }}>
        Home
      </BSBreadcrumb.Item>
      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        
        return isLast ? (
          <BSBreadcrumb.Item active key={name}>
            {getTitleFromPath(name)}
          </BSBreadcrumb.Item>
        ) : (
          <BSBreadcrumb.Item
            key={name}
            linkAs={Link}
            linkProps={{ to: routeTo }}
          >
            {getTitleFromPath(name)}
          </BSBreadcrumb.Item>
        );
      })}
    </BSBreadcrumb>
  );
};

export default Breadcrumb; 