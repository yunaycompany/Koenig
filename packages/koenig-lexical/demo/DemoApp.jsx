import React, {useState, useEffect} from 'react';
import {debounce} from 'lodash';
import TitleTextBox from './components/TitleTextBox';
import FeaturedImage from './components/FeaturedImage';
import basicContent from './content/basic-content.json';
import content from './content/content.json';
import minimalContent from './content/minimal-content.json';
import {$getRoot, $isDecoratorNode} from 'lexical';
import {
    BASIC_NODES, BASIC_TRANSFORMERS, HtmlOutputPlugin, KoenigComposableEditor,
    KoenigComposer, KoenigEditor, MINIMAL_NODES, MINIMAL_TRANSFORMERS,
    // MobiledocCopyPlugin,
    RestrictContentPlugin,
    TKCountPlugin,
    WordCountPlugin
} from '../src';
import {defaultHeaders as defaultUnsplashHeaders} from './utils/unsplashConfig';
import {fetchEmbed} from './utils/fetchEmbed';
import {fileTypes, useFileUpload} from './utils/useFileUpload';
import {tenorConfig} from './utils/tenorConfig';
import {useCollections} from './utils/useCollections';
import {useLocation, useSearchParams} from 'react-router-dom';
import {useSnippets} from './utils/useSnippets';
import ImgPlaceholderIcon from '../src/assets/icons/kg-img-placeholder.svg?react';
const url = new URL(window.location.href);
const params = new URLSearchParams(url.search);
const WEBSOCKET_ENDPOINT = params.get('multiplayerEndpoint') || 'ws://localhost:1234';
const WEBSOCKET_ID = params.get('multiplayerId') || '0';

const cardConfig = {
    unsplash: {defaultHeaders: defaultUnsplashHeaders},
    fetchEmbed: fetchEmbed,
    tenor: tenorConfig,
    fetchAutocompleteLinks: () => Promise.resolve([
        {label: 'Homepage', value: window.location.origin + '/'},
        {label: 'Free signup', value: window.location.origin + '/#/portal/signup/free'}
    ]),
    fetchLabels: () => Promise.resolve(['Label 1', 'Label 2']),
    siteTitle: 'Koenig Lexical',
    siteDescription: `There's a whole lot to discover in this editor. Let us help you settle in.`,
    membersEnabled: true,
    feature: {
        collections: true,
        collectionsCard: true
    },
    deprecated: {
        headerV1: process.env.NODE_ENV === 'test' ? false : true // show header v1 only for tests
    }
};

function getDefaultContent({editorType}) {
    if (editorType === 'basic') {
        return basicContent;
    } else if (editorType === 'minimal') {
        return minimalContent;
    }
    return content;
}

function getAllowedNodes({editorType}) {
    if (editorType === 'basic') {
        return BASIC_NODES;
    } else if (editorType === 'minimal') {
        return MINIMAL_NODES;
    }
    return undefined;
}

function DemoEditor({editorType, registerAPI, cursorDidExitAtTop, darkMode, setWordCount, html, setHtml, setTKCount}) {
    if (editorType === 'basic') {
        return (
            <KoenigComposableEditor
                cursorDidExitAtTop={cursorDidExitAtTop}
                markdownTransformers={BASIC_TRANSFORMERS}
                registerAPI={registerAPI}
            >
                <WordCountPlugin onChange={setWordCount} />
            </KoenigComposableEditor>
        );
    } else if (editorType === 'minimal') {
        return (
            <KoenigComposableEditor
                cursorDidExitAtTop={cursorDidExitAtTop}
                isSnippetsEnabled={false}
                markdownTransformers={MINIMAL_TRANSFORMERS}
                registerAPI={registerAPI}
            >
                <RestrictContentPlugin paragraphs={1} />
                <WordCountPlugin onChange={setWordCount} />
            </KoenigComposableEditor>
        );
    }

    return (
        <KoenigEditor
            cursorDidExitAtTop={cursorDidExitAtTop}
            darkMode={darkMode}
            registerAPI={registerAPI}
        >
            {/*<MobiledocCopyPlugin />*/}
            <HtmlOutputPlugin html={html} setHtml={setHtml}/>
            <WordCountPlugin onChange={setWordCount} />
            <TKCountPlugin onChange={setTKCount} />
        </KoenigEditor>
    );
}

function DemoComposer({editorType, isMultiplayer, setWordCount, setTKCount}) {
    const [searchParams, setSearchParams] = useSearchParams();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [sidebarView, setSidebarView] = useState('json');
    const {snippets, createSnippet, deleteSnippet} = useSnippets();
    const {collections, fetchCollectionPosts} = useCollections();
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [html, setHtml] = useState('');

    const skipFocusEditor = React.useRef(false);

    const darkMode = searchParams.get('darkMode') === 'true';
    const [contentFromParent, setContentFromParent] = useState(null);


    const defaultContent = React.useMemo(() => {
        return JSON.stringify(getDefaultContent({editorType}));
    }, [editorType]);

    const initialContent = React.useMemo(() => {
        if (isMultiplayer) {
            return null;
        }

        return contentFromParent || undefined;
    }, [isMultiplayer, contentFromParent, defaultContent]);

    useEffect(() => {
        const handleMessage = (event) => {
            console.log('Origin:', event.origin);
            const allowedOrigins = [
                "https://pepcore-dev.peptalk.com",
                "https://pepcore.peptalk.com",
                "http://localhost:8000",
                "http://pepcore.peptalk.localhost"
            ];
            if (!allowedOrigins.includes(event.origin)) {
                return;
            }
            const lexical = JSON.parse(event.data.lexical);
            const title = event.data.title;
            const previewIma = event.data.feature_image;
            setContentFromParent(lexical);
            setTitle(title);
            setPreviewImage(previewIma);
        };

        window.addEventListener('message', handleMessage);

        // Cleanup listener when component unmounts
        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, []);
    const [previewImage, setPreviewImage] = useState('');
    const [title, setTitle] = useState(initialContent ? 'Meet the Koenig editor.' : '');
    const [editorAPI, setEditorAPI] = useState(null);
    const titleRef = React.useRef(null);
    const containerRef = React.useRef(null);
    const [editorContent, setEditorContent] = useState(initialContent);
    const [isTyping, setIsTyping] = useState(false);
    useEffect(() => {
        if (!isTyping && editorAPI) {
            saveContent();
        }
    }, [isTyping]);

    useEffect(() => {
        if (editorAPI) {
            saveContent();
        }
    }, [previewImage]);

    useEffect(() => {
        if (editorAPI) {
            const checkContentChange = () => {
                const currentContent = editorAPI.serialize(); // Assuming `serialize` returns the current content

                // Check if it's the initial load
                if (isInitialLoad) {
                    setEditorContent(currentContent);
                    setIsInitialLoad(false);
                } else if (currentContent !== editorContent) {
                    setEditorContent(currentContent);
                    // Only autosave if it's not the initial load
                    console.log('Content changed, autosaving...');
                    saveContent();
                }
            };

            // Poll for content changes every 500 milliseconds
            const intervalId = setInterval(checkContentChange, 3000);

            return () => clearInterval(intervalId);
        }
    }, [editorAPI, editorContent, isInitialLoad]);

    const handleIsTyping = debounce(function () {
        // continually delays setting "isTyping" to false for 500ms until the user has stopped typing and the delay runs out
        setIsTyping(false);
    }, 800);

    function updateTitle(title) {
        setIsTyping(true);
        handleIsTyping();
        setTitle(title);
    }

    function updatePreviewImage(image) {
        setPreviewImage(image);
    }

    function saveContent() {
        const serializedState = editorAPI.serialize();
        const data = {
            title: title === '' ? '(Untitled)' : title,
            previewImage: previewImage,
            lexical: serializedState,
            html
        };
        console.log('Message sent to parent:', data);
        sendMessageToParent('Saved', data);
    }
    function sendMessageToParent(eventName, data) {
        const message = { eventName, data};
        window.parent.postMessage(message, "*");
    }

    React.useEffect(() => {
        const handleFileDrag = (event) => {
            event.preventDefault();
        };

        const handleFileDrop = (event) => {
            if (event.dataTransfer.files.length > 0) {
                event.preventDefault();
                editorAPI?.insertFiles(Array.from(event.dataTransfer.files));
            }
        };

        window.addEventListener('dragover', handleFileDrag);
        window.addEventListener('drop', handleFileDrop);

        return () => {
            window.removeEventListener('dragover', handleFileDrag);
            window.removeEventListener('drop', handleFileDrop);
        };
    }, [editorAPI]);

    const showTitle = !isMultiplayer && !['basic', 'minimal'].includes(editorType);

    return (
        <KoenigComposer
            key={initialContent}
            cardConfig={{...cardConfig, snippets, createSnippet, deleteSnippet, collections, fetchCollectionPosts}}
            darkMode={darkMode}
            enableMultiplayer={isMultiplayer}
            fileUploader={{useFileUpload: useFileUpload({isMultiplayer}), fileTypes}}
            initialEditorState={initialContent}
            isTKEnabled={true} // TODO: can we move this onto <KoenigEditor>?
            multiplayerDocId={`demo/${WEBSOCKET_ID}`}
            multiplayerEndpoint={WEBSOCKET_ENDPOINT}
            nodes={getAllowedNodes({editorType})}
        >
            <div className={`koenig-demo relative h-full grow ${darkMode ? 'dark' : ''}`} style={{'--kg-breakout-adjustment': isSidebarOpen ? '440px' : '0px'}}>
                <div ref={containerRef} className="h-full overflow-x-hidden">
                    <div className="mx-auto max-w-[740px] px-6 py-[5vmin] lg:px-0">
                        <FeaturedImage desc="Click to select a feature image" Icon={ImgPlaceholderIcon} alt="Upload" previewImage={previewImage} setPreviewImage={updatePreviewImage}/>
                        {showTitle
                            ? <TitleTextBox ref={titleRef} editorAPI={editorAPI} setTitle={updateTitle} title={title} />
                            : null
                        }
                        <DemoEditor
                            darkMode={darkMode}
                            editorType={editorType}
                            registerAPI={setEditorAPI}
                            setTKCount={setTKCount}
                            setHtml={setHtml}
                            html={html}

                        />
                    </div>
                </div>
            </div>
        </KoenigComposer>
    );
}

const MemoizedDemoComposer = React.memo(DemoComposer);

function DemoApp({editorType, isMultiplayer}) {
    const [wordCount, setWordCount] = useState(0);
    const [tkCount, setTKCount] = useState(0);
    // used to force a re-initialization of the editor when URL changes, otherwise
    // content is memoized and causes issues when switching between editor types
    const location = useLocation();

    return (
        <div
            key={location.key}
            className={`koenig-lexical top`}
        >
            {/* outside of DemoComposer to avoid re-renders and flaky tests when word count changes */}
            <MemoizedDemoComposer
                editorType={editorType}
                isMultiplayer={isMultiplayer}
                setTKCount={setTKCount}
                setWordCount={setWordCount}
            />
        </div>
    );
}

export default DemoApp;
