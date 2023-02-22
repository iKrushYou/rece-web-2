import { Link } from 'react-router-dom';
import { ComponentProps, FunctionComponent } from 'react';

const UnstyledLink: FunctionComponent<ComponentProps<Link>> = ({ children, style, ...otherProps }) => (
  <Link style={{ color: 'inherit', textDecoration: 'inherit', ...style }} {...otherProps}>
    {children}
  </Link>
);

export default UnstyledLink;
