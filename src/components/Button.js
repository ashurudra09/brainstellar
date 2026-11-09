
import React, { useState } from 'react';


const Button = ({ id, label, content, backgroundColor, onToggle, passClass, forceOpen }) => {
  const [hidden, setIsHidden] = useState(true);
  const isHidden = hidden && !forceOpen;

  const toggleContent = () => {
    setIsHidden(!isHidden);
    onToggle && onToggle(); // Call the onToggle prop if it exists
  };

  return (
    <>
      <div>
        <button style={{ display: `inline-block` }} id={`${id}Button`} className={`push ${isHidden ? '' : 'pushed'}`} onClick={toggleContent}>{label}</button>
        <span id={id} className={isHidden ? 'hidden' : `unhidden ${passClass}`}>
          <div className="around" style={{ backgroundColor: backgroundColor }}>
            {content}
          </div>
        </span>
      </div>
    </>
  );
}

export default Button;
