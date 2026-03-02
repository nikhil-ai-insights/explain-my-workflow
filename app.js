document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const browseBtn = document.getElementById('browse-btn');
    const uploadSection = document.getElementById('upload-section');
    const resultSection = document.getElementById('result-section');
    const guideContainer = document.getElementById('guide-container');
    const wfNameDisplay = document.getElementById('wf-name');
    const nodeCountDisplay = document.getElementById('node-count');
    const triggerDisplay = document.getElementById('wf-trigger');
    const copyBtn = document.getElementById('copy-btn');
    const resetBtn = document.getElementById('reset-btn');
    const toast = document.getElementById('toast');

    // API Key from user
    const API_KEY = "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";
    const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

    let currentGuideText = "";

    // Event Listeners
    browseBtn.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', handleFileSelect);

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file) processFile(file);
    });

    copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(currentGuideText).then(() => {
            showToast("Guide copied to clipboard!", "success");
        });
    });

    resetBtn.addEventListener('click', () => {
        resultSection.classList.add('hidden');
        uploadSection.classList.remove('hidden');
        fileInput.value = '';
    });

    function handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) processFile(file);
    }

    function processFile(file) {
        if (!file.name.endsWith('.json')) {
            showToast("Invalid file type. Please upload a .json file.");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const workflow = JSON.parse(e.target.result);
                analyzeWorkflow(workflow);
            } catch (err) {
                showToast("Invalid n8n workflow file (JSON error).");
                console.error(err);
            }
        };
        reader.readAsText(file);
    }

    function showToast(msg, type = "error") {
        toast.textContent = msg;
        toast.className = `toast ${type}`;
        toast.classList.remove('hidden');
        setTimeout(() => toast.classList.add('hidden'), 3000);
    }

    async function analyzeWorkflow(wf) {
        const nodes = wf.nodes || [];
        if (nodes.length === 0) {
            showToast("No nodes found in this workflow.");
            return;
        }

        const connections = wf.connections || {};
        const meta = wf.meta || {};
        const name = wf.name || "Untitled Workflow";

        wfNameDisplay.textContent = name;
        nodeCountDisplay.textContent = nodes.length;

        // Try to identify trigger
        const triggerNode = nodes.find(n => n.type.toLowerCase().includes('trigger') || n.type.toLowerCase().includes('webhook'));
        triggerDisplay.textContent = triggerNode ? `Trigger: ${triggerNode.name}` : "Trigger: Manual / Unknown";

        await generateGuide(nodes, connections, name);

        uploadSection.classList.add('hidden');
        resultSection.classList.remove('hidden');
    }

    async function generateGuide(nodes, connections, wfName) {
        guideContainer.innerHTML = '';
        let guideMarkdown = `# Setup Guide: ${wfName}\n\n`;

        const steps = [
            {
                title: "Create a new workflow in n8n",
                details: ["Open your n8n instance", "Click on '+ New' to create a fresh canvas."]
            }
        ];

        // Step 2 & 4: Add and Configure Nodes
        for (const [index, node] of nodes.entries()) {
            const stepTitle = `Add & Configure: ${node.name}`;
            const typeLabel = node.type.split('.').pop();

            const purpose = await getPurpose(node.type);

            const details = [
                `Node Type: **${typeLabel}**`,
                `Purpose: ${purpose}`
            ];

            if (node.credentials) {
                const credKeys = Object.keys(node.credentials).join(', ');
                details.push(`<span class="credential-needed">Requires Credentials: ${credKeys}</span>`);
            }

            const paramCount = node.parameters ? Object.keys(node.parameters).length : 0;
            if (paramCount > 0) {
                details.push(`Configuration: Check ${paramCount} parameters in node settings.`);
            }

            steps.push({ title: stepTitle, details });
        }

        // Connection Step
        steps.push({
            title: "Connect nodes in correct order",
            details: [
                "Follow the visual flow: Trigger -> Actions.",
                "Ensure all output ports are linked to the downstream inputs."
            ]
        });

        // Final Steps
        steps.push({
            title: "Test & Activate",
            details: [
                "Click 'Execute Workflow' to test for errors.",
                "Once verified, toggle the 'Active' switch."
            ]
        });

        steps.forEach((step, idx) => {
            const card = document.createElement('div');
            card.className = 'step-card';
            card.style.animationDelay = `${idx * 0.1}s`;

            const num = document.createElement('span');
            num.className = 'step-num';
            num.textContent = `STEP ${idx + 1}`;

            const h3 = document.createElement('h3');
            h3.textContent = step.title;

            const ul = document.createElement('ul');
            ul.className = 'step-detail';
            step.details.forEach(detail => {
                const li = document.createElement('li');
                li.innerHTML = detail;
                ul.appendChild(li);
            });

            card.appendChild(num);
            card.appendChild(h3);
            card.appendChild(ul);
            guideContainer.appendChild(card);

            // Build markdown
            guideMarkdown += `## Step ${idx + 1}: ${step.title}\n`;
            step.details.forEach(d => {
                const cleanText = d.replace(/<[^>]*>/g, '');
                guideMarkdown += `- ${cleanText}\n`;
            });
            guideMarkdown += `\n`;
        });

        currentGuideText = guideMarkdown;
    }

    async function getPurpose(type) {
        // Fallback simple purpose
        const fallback = {
            'Webhook': "Receives incoming HTTP requests.",
            'Trigger': "Main starting point for the automation.",
            'HttpRequest': "Sends data to an external API.",
            'Set': "Transforms or formats data fields.",
            'Code': "Runs custom JavaScript or Python code.",
            'Slack': "Sends a notification to a Slack channel.",
            'Discord': "Sends a notification to a Discord webhook.",
            'GoogleSheet': "Appends or reads data from a Google Sheet."
        };

        const key = Object.keys(fallback).find(k => type.includes(k));
        let basePurpose = fallback[key] || "Processes or transforms data in the workflow.";

        if (!API_KEY) return basePurpose;

        try {
            const response = await fetch(OPENROUTER_URL, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${API_KEY}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://explain-my-workflow.local",
                    "X-Title": "Explain My Workflow"
                },
                body: JSON.stringify({
                    model: "openai/gpt-3.5-turbo",
                    messages: [
                        { role: "system", content: "You are an expert n8n workflow documenter. Explain node purposes concisely." },
                        { role: "user", content: `Explain the purpose of an n8n node with type "${type}" in one short sentence.` }
                    ]
                })
            });

            const data = await response.json();
            return data.choices[0].message.content || basePurpose;
        } catch (err) {
            console.error("AI Generation failed:", err);
            return basePurpose;
        }
    }
});
