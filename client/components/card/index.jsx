/** @format */

/**
 * External dependencies
 */
import React, { PureComponent } from "react";
import classNames from "classnames";
import Gridicon from "gridicons";
import PropTypes from "prop-types";

const getClassName = ({ className, compact, highlight, href, onClick }) =>
  classNames(
    "card",
    className,
    {
      "is-card-link": !!href,
      "is-clickable": !!onClick,
      "is-compact": compact,
      "is-highlight": highlight
    },
    highlight ? "is-" + highlight : false
  );

class Card extends PureComponent {
  static propTypes = {
    className: PropTypes.string,
    href: PropTypes.string,
    tagName: PropTypes.oneOfType([PropTypes.func, PropTypes.string]).isRequired,
    target: PropTypes.string,
    compact: PropTypes.bool,
    highlight: PropTypes.oneOf([false, "error", "info", "success", "warning"])
  };

  static defaultProps = {
    tagName: "div",
    highlight: false
  };

  render() {
    const {
      children,
      compact,
      highlight,
      tagName: TagName,
      href,
      target,
      ...props
    } = this.props;

    return href ? (
      <a
        {...props}
        href={href}
        target={target}
        className={getClassName(this.props)}
      >
        <Gridicon
          className="card__link-indicator"
          icon={target ? "external" : "chevron-right"}
        />
        {children}
      </a>
    ) : (
      <TagName {...props} className={getClassName(this.props)}>
        {children}
      </TagName>
    );
  }
}

export default Card;
