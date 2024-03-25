import {useState} from 'react';

function getSnippetsFromStorage() {
    const snippetsStr = localStorage.getItem('snippets');
    const allSnippets =  [
            {
                "id": "65733c87f20b6900a0b28195",
                "name": "PDF Content",
                "mobiledoc": "{}",
                "lexical": {
                    "namespace": "KoenigEditor",
                    "nodes": [
                        {
                            "type": "html",
                            "version": 1,
                            "html": "<embed src=\"https://content.peptalk.ie/Check+In+Content/REST/12+everyday+foods+that+can+help+you+sleep..pdf\" type=\"application/pdf\" width=\"100%\" height=\"100%\" style=\"min-height: 4500px; width: 100%;\">\n</embed>"
                        }
                    ]
                },
                "created_at": "2023-12-08T15:55:51.000Z",
                "updated_at": "2023-12-08T15:55:51.000Z"
            },
            {
                "id": "657354f2f20b6900a0b281f4",
                "name": "Video Content",
                "mobiledoc": "{}",
                "lexical": {
                "namespace": "KoenigEditor",
                "nodes": [
                    {
                        "type": "html",
                        "version": 1,
                        "html": " <video style=\"width:100%\" class=\"w3-margin-bottom\" controls=\"\" oncontextmenu=\"return false;\">\n   <source src=\"https://content.peptalk.ie/Academy/Library/EOIN+SHEEHAN/2023+Updated+Branding/Energy_Balls_Updated_Branding.mp4\" type=\"video/mp4\">\n   <source src=\"https://content.peptalk.ie/Academy/Library/EOIN+SHEEHAN/2023+Updated+Branding/Energy_Balls_Updated_Branding.mp4\" type=\"video/ogg\">\n   Your browser does not support HTML video.\n  </video>"
                    }
                ]
            },
                "created_at": "2023-12-08T17:40:02.000Z",
                "updated_at": "2023-12-08T17:40:02.000Z"
            }
        ]
    const snippets = allSnippets.map((item) => {
        item.value = JSON.stringify(item.lexical);

        return item;
    });
    return snippetsStr ? JSON.parse(snippetsStr) : snippets;
}

function updateSnippetsInStorage(snippetsArr = []) {
    localStorage.setItem('snippets', JSON.stringify(snippetsArr));
}

export const useSnippets = () => {
    const [snippets, setSnippets] = useState(getSnippetsFromStorage());

    function createSnippet({name, value}) {
        const updatedSnippets = [...snippets];
        const snippetIndexForReplace = snippets.findIndex(item => item.name === name);
        if (snippetIndexForReplace === -1) {
            updatedSnippets.push({name, value});
        } else {
            updatedSnippets[snippetIndexForReplace].value = value;
        }

        setSnippets(updatedSnippets);
        updateSnippetsInStorage(updatedSnippets);
    }

    function deleteSnippet(snippet) {
        const updatedSnippets = snippets.filter(item => item.name !== snippet.name);
        setSnippets(updatedSnippets);
        updateSnippetsInStorage(updatedSnippets);
    }

    return {
        createSnippet,
        deleteSnippet,
        snippets
    };
};
