import { Action } from '../types';
import { fetchTaskFromOpenRouter } from '../api/openrouter';
import { fetchDatasetFromHuggingFace } from '../api/huggingface';

const CACHE_NAME = 'task-automation-cache';

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll([
                // Add any assets to cache if needed
            ]);
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'GENERATE_TASK') {
        const actions: Action[] = event.data.actions;
        generateTask(actions);
    }
});

async function generateTask(actions: Action[]) {
    try {
        const taskData = await fetchTaskFromOpenRouter(actions);
        const dataset = await fetchDatasetFromHuggingFace(taskData);
        // Process the dataset and send back the result
        self.clients.matchAll().then(clients => {
            clients.forEach(client => {
                client.postMessage({ type: 'TASK_GENERATED', data: dataset });
            });
        });
    } catch (error) {
        console.error('Error generating task:', error);
    }
}