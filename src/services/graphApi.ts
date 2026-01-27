export interface GraphApiPage {
    id: string;
    name: string;
    access_token?: string;
    instagram_business_account?: {
        id: string;
        username?: string;
        profile_picture_url?: string;
        followers_count?: number;
    };
    picture?: {
        data: {
            url: string;
        }
    };
    fan_count?: number;
}

interface TokenExchangeResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
}

export const graphApiService = {
    async validateToken(token: string) {
        try {
            // Check basic token validity
            const response = await fetch(`https://graph.facebook.com/v19.0/me?fields=id,name&access_token=${token}`);
            if (!response.ok) {
                const error = await response.json();
                return { valid: false, error: error.error?.message || 'Token inválido' };
            }
            const data = await response.json();
            return { valid: true, name: data.name, id: data.id };
        } catch (error: any) {
            console.error('Error validating token:', error);
            return { valid: false, error: error.message };
        }
    },

    async getInstagramUserId(pageId: string, accessToken: string) {
        try {
            // Fetch IG Business Account linked to a Facebook Page
            const response = await fetch(
                `https://graph.facebook.com/v19.0/${pageId}?fields=instagram_business_account&access_token=${accessToken}`
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'Erro ao buscar Instagram User ID');
            }

            const data = await response.json();
            return data.instagram_business_account?.id || null;
        } catch (error) {
            console.error('Error fetching IG User ID:', error);
            return null;
        }
    },

    async fetchAccounts(token: string) {
        try {
            // Fetch Pages with their IG Business Accounts
            const response = await fetch(
                `https://graph.facebook.com/v19.0/me/accounts?fields=id,name,access_token,picture{url},fan_count,instagram_business_account{id,username,profile_picture_url,followers_count}&access_token=${token}`
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'Erro ao buscar contas');
            }

            const data = await response.json();
            return data.data as GraphApiPage[];
        } catch (error) {
            console.error('Error fetching accounts:', error);
            throw error;
        }
    },

    async exchangeForLongLivedToken(shortTermToken: string, appId: string, appSecret: string) {
        try {
            const response = await fetch(
                `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${shortTermToken}`
            );

            if (!response.ok) {
                const error = await response.json();
                console.error('Token Exchange Error:', error);
                throw new Error(error.error?.message || 'Falha ao trocar token de longa duração');
            }

            const data: TokenExchangeResponse = await response.json();
            return {
                access_token: data.access_token,
                expires_in: data.expires_in
            };
        } catch (error) {
            console.error('Error exchanging token:', error);
            throw error;
        }
    },

    async publishToFacebook(pageId: string, accessToken: string, media: string | File, caption: string, isVideo: boolean = false) {
        try {
            const formData = new FormData();
            formData.append('access_token', accessToken);
            // 'description' is used for videos, 'message' for photos
            if (isVideo) {
                formData.append('description', caption);
            } else {
                formData.append('message', caption);
            }

            if (typeof media === 'string') {
                if (isVideo) {
                    formData.append('file_url', media);
                } else {
                    formData.append('url', media);
                }
            } else {
                // For source uploads
                formData.append('source', media);
            }

            const endpoint = isVideo ? 'videos' : 'photos';
            const response = await fetch(`https://graph.facebook.com/v19.0/${pageId}/${endpoint}`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error?.message || `Erro ao publicar ${isVideo ? 'vídeo' : 'imagem'} no Facebook`);
            }

            return data;
        } catch (error) {
            console.error('FB Publish Error:', error);
            throw error;
        }
    },

    async publishToInstagram(igUserId: string, accessToken: string, mediaUrl: string, caption: string, isVideo: boolean = false) {
        try {
            // Step 1: Create Media Container
            const params = new URLSearchParams({
                access_token: accessToken,
                caption: caption,
            });

            if (isVideo) {
                params.append('media_type', 'REELS');
                params.append('video_url', mediaUrl);
            } else {
                params.append('image_url', mediaUrl);
            }

            const containerResponse = await fetch(
                `https://graph.facebook.com/v19.0/${igUserId}/media?${params.toString()}`,
                { method: 'POST' }
            );

            const containerData = await containerResponse.json();
            if (!containerResponse.ok) {
                throw new Error(containerData.error?.message || 'Erro ao criar container no Instagram');
            }

            const creationId = containerData.id;
            if (!creationId) throw new Error('Falha ao obter ID de criação do Instagram');

            // Step 2: Poll for status
            let isReady = false;
            let attempts = 0;
            const maxAttempts = isVideo ? 45 : 15; // Increased timeout for videos

            while (!isReady && attempts < maxAttempts) {
                attempts++;
                // Wait 2 seconds before checking
                await new Promise(resolve => setTimeout(resolve, 2000));

                const statusResponse = await fetch(
                    `https://graph.facebook.com/v19.0/${creationId}?fields=status_code,status&access_token=${accessToken}`
                );

                if (statusResponse.ok) {
                    const statusData = await statusResponse.json();
                    if (statusData.status_code === 'FINISHED') {
                        isReady = true;
                    } else if (statusData.status_code === 'ERROR') {
                        throw new Error('O Instagram não conseguiu processar esta mídia. Verifique o formato.');
                    }
                }
            }

            if (!isReady) {
                throw new Error('Tempo limite de processamento do Instagram esgotado.');
            }

            // Step 3: Publish Media
            const publishResponse = await fetch(
                `https://graph.facebook.com/v19.0/${igUserId}/media_publish?creation_id=${creationId}&access_token=${accessToken}`,
                { method: 'POST' }
            );

            const publishData = await publishResponse.json();
            if (!publishResponse.ok) {
                throw new Error(publishData.error?.message || 'Erro ao finalizar publicação no Instagram');
            }

            return publishData;
        } catch (error) {
            console.error('IG Publish Error:', error);
            throw error;
        }
    }
};
