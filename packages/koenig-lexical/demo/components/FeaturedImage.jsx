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
        <div className="my-2">
            {previewImageLocal && (
                <div className="flex flex-row items-center mt-6 relative">
                    <a href="#" onClick={handleRemoveImage} className="absolute top-1 end-1 rounded-md bg-gray-200 p-1 text-gray-900 shadow-sm hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="w-6 h-6"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                            />
                        </svg>
                    </a>
                    <figure className="rounded-xl">
                        <img src={previewImageLocal} alt="Preview"className="object-cover rounded-xl max-w-[670px] max-h-[400px]" accept="image/png, image/jpeg,image/jpg" />
                    </figure>
                </div>
            )}
            {!previewImageLocal && isLoading && (
                <div
                    className="w-[200px] bg-gray-200 rounded-full dark:bg-gray-700"
                >
                    <div
                        className="bg-blue-600 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-full w-[45%]"
                    >
                        45%
                    </div>
                </div>
            )}
            {!previewImageLocal && (
                <div className="flex flex-row items-center">
                    <input type="file" id="custom-input" hidden="" onChange={handleFileChange} className="hidden"/>
                    <label htmlFor="custom-input" className="block text-sm text-slate-500 mr-4 py-2 px-4 rounded-md border-0 font-semibold bg-pink-50 text-pink-700 hover:bg-pink-100 cursor-pointer flex">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
                        </svg>
                        Add feature image
                    </label>
                </div>
            )}
        </div>
    );
}

export default FeaturedImaged;
