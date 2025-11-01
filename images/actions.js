/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import useStore from './store'
import {queryLlm, generateDescription} from './llm'
import {queryPrompt} from './prompts'

const get = useStore.getState
const set = useStore.setState

export const init = async () => {
  if (get().didInit) {
    return
  }

  set(state => {
    state.didInit = true
  })

  const [images, sphere, umapGrid] = await Promise.all(
    ['meta', 'sphere', 'umap-grid'].map(
      path => fetch(path + '.json').then(res => res.json())
    )
  )

  const storageRoot = 'https://www.gstatic.com/aistudio/starter-apps/photosphere/';
  const imagesWithUrls = images.map(img => ({
    ...img,
    url: `${storageRoot}${img.id}`
  }));

  set(state => {
    state.images = imagesWithUrls
    state.layouts = {
      sphere,
      grid: Object.fromEntries(
        Object.entries(umapGrid).map(([k, [x, y]]) => [
          k,
          [x, y / (16 / 9) + 0.25]
        ])
      )
    }
    state.nodePositions = Object.fromEntries(
      images.map(({id}) => [id, [0.5, 0.5, 0.5]])
    )
  })

  setLayout('sphere')
}

export const setLayout = layout =>
  set(state => {
    state.layout = layout
    state.nodePositions = state.layouts[layout]
  })

export const setSphereLayout = positions =>
  set(state => {
    state.layouts.sphere = positions
  })

export const sendQuery = async query => {
  set(state => {
    state.isFetching = true
    state.targetImage = null
    state.resetCam = true
    state.caption = null
  })
  try {
    const res = await queryLlm({prompt: queryPrompt(get().images, query)})
    try{
      const resJ = JSON.parse(res.replace('```json','').replace('```',''));
      set(state => {
        state.highlightNodes = resJ.filenames
        state.caption = resJ.commentary
      })
    }catch(e){
      console.error(e)
    }

  } finally {
    set(state => {
      state.isFetching = false
    })
  }
}

export const uploadImages = async (files) => {
  if (!files || files.length === 0) {
    return;
  }
  
  set(state => {
    state.isFetching = true;
    state.caption = `Uploading ${files.length} image${files.length > 1 ? 's' : ''}...`;
  });

  const uploadPromises = Array.from(files).map(async (file) => {
    const id = `local-${Date.now()}-${file.name}`;
    const url = URL.createObjectURL(file);
    const tempImage = { id, description: 'Generating description...', url };

    set(state => {
      state.images.unshift(tempImage);
      state.nodePositions[id] = [Math.random(), Math.random(), Math.random()];
    });

    try {
      const description = await generateDescription(file);
      set(state => {
        const imageToUpdate = state.images.find(img => img.id === id);
        if (imageToUpdate) {
          imageToUpdate.description = description;
        }
      });
    } catch (e) {
      console.error("Failed to generate description", e);
      set(state => {
        const imageToUpdate = state.images.find(img => img.id === id);
        if (imageToUpdate) {
          imageToUpdate.description = 'Error: Could not generate description.';
        }
      });
    }
  });

  await Promise.all(uploadPromises);

  set(state => {
    state.isFetching = false;
    state.caption = `Successfully added ${files.length} new image${files.length > 1 ? 's' : ''}.`;
  });
};


export const clearQuery = () =>
  set(state => {
    state.highlightNodes = null
    state.caption = null
    state.targetImage = null
  })

export const setXRayMode = xRayMode =>
  set(state => {
    state.xRayMode = xRayMode
  })

export const setTargetImage = async targetImage => {
  if (targetImage === get().targetImage) {
    targetImage = null
  }

  set(state => {
    state.targetImage = targetImage
    state.isFetching = !!targetImage
    state.highlightNodes = null
    if (targetImage) {
      state.isSidebarOpen = true
    }
  })

  if (!targetImage) {
    return
  }

  set(state => {
    state.isFetching = false
  })
}

export const toggleSidebar = () =>
  set(state => {
    state.isSidebarOpen = !state.isSidebarOpen
  })

export const setSidebarOpen = isOpen =>
  set(state => {
    state.isSidebarOpen = isOpen
  })

init()