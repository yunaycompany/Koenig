import React, { useState, useEffect } from 'react';
import DeleteIcon from '../../src/assets/icons/kg-trash.svg?react';
import { useFileUpload } from '../utils/useFileUpload';
import {IconButton} from "../../src/components/ui/IconButton.jsx";

function FeaturedImaged({ desc, Icon, previewImage, setPreviewImage }) {
    const { progress, isLoading, upload, errors, filesNumber } = useFileUpload()('image');

    const [previewImageLocal, setPreviewImageLocal] = useState(null);

    useEffect(() => {
        if(previewImage){
            setPreviewImageLocal(previewImage);
        }
    }, [previewImage]);


    // Handle file selection and upload
    const handleFileChange = async (event) => {
        const files = event.target.files;
        const file = files[0]; // Assuming only one file is selected
        if (file) {
            // Read the file as a data URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImageLocal(reader.result);
            };
            reader.readAsDataURL(file);
        }
       const uploadResult= await upload(files);
        if(uploadResult && uploadResult.length >0 && uploadResult[0].url){
            setPreviewImage(uploadResult[0].url);
        }

    };

    const handleRemoveImage = () => {
        setPreviewImageLocal(null);
        setPreviewImage(null);
    };


    return (
        <div className="relative featured-image-container">
            <figure className="cursor-pointer border border-transparent">
                <div className="h-20 relative flex items-center justify-center border border-grey-100 bg-grey-50 before:pb-[62.5%]">
                    <label className="group flex flex-col items-center justify-center p-10" htmlFor="fileInput">
                        <input
                            id="fileInput"
                            className="absolute featured-image-input"
                            accept='image/*'
                            name="image"
                            type='file'
                            onChange={handleFileChange} // Call handleFileChange on file selection
                        />
                        {/* Display the preview image if available */}
                        {previewImageLocal && (
                            <div className="relative">
                            <img src={previewImageLocal} alt="Preview" className="h-full w-full object-cover" />
                                <div className="absolute right-0 mt-2 mr-2 bg-white rounded-full">
                                    <IconButton dataTestId="media-upload-remove" Icon={DeleteIcon} onClick={handleRemoveImage} />
                                </div>
                            </div>
                        )}
                        {/* If no preview image is available, display the icon */}
                        {!previewImageLocal && (
                            <div className="group flex flex-col items-center justify-center p-10">
                            <Icon className="h-10 w-10 opacity-80 transition-all ease-linear group-hover:scale-105 group-hover:opacity-100" />
                            <p className="mt-4 text-sm font-normal text-grey-700 group-hover:text-grey-800">{desc}</p>
                            </div>
                        )}


                    </label>
                </div>
            </figure>
            {isLoading && (
                <p>Uploading image...</p>
            )}
        </div>
    );
}

export default FeaturedImaged;
