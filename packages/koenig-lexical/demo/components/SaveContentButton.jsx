import React from 'react';

const SaveContentButton = ({onSaveContent}) => {
    return (
        <>
            <div className="absolute right-6 top-4 z-20 block h-[22px] w-[42px] cursor-pointer rounded-full">
                <button type="button" onClick={onSaveContent}>💾</button>
            </div>
        </>
    );
};

export default SaveContentButton;
