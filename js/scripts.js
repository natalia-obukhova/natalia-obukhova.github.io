document.addEventListener('DOMContentLoaded', () => {
  let contentData = null; // Store JSON data globally for reuse

  // Load components.json once and store globally
  fetch('components/components.json')
    .then((response) => {
      if (!response.ok) {
        throw new Error('Could not fetch components.json');
      }
      return response.json();
    })
    .then((data) => {
      contentData = data; // Store data for later use

      // Load predefined components (e.g., navbar)
      data.components.forEach((component) => {
        fetchComponentById(component.id, component.path);
      });

      // Set up dynamic page loading for main content
      setupNavbarListeners(data.pages);

      // Load the default page (home)
      loadPageContent('home', data.pages);

      // Automatically load projects and blog posts into matching divs
      loadContentByIdFromJSON(data.projects);
      loadContentByIdFromJSON(data.blogPosts);
    })
    .catch((error) => {
      console.error('Error fetching components.json:', error);
    });

  // Function to fetch and inject a component by ID (e.g., navbar)
  function fetchComponentById(id, path) {
    fetch(path)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Could not fetch ${path}`);
        }
        return response.text();
      })
      .then((data) => {
        const element = document.getElementById(id);
        if (element) {
          element.innerHTML = data;
        }
      })
      .catch((error) => {
        console.error(`Error fetching ${path}:`, error);
      });
  }

  // Dynamically load projects or blog posts into their respective divs
  function loadContentByIdFromJSON(contentArray) {
    contentArray.forEach((item) => {
      const targetElement = document.getElementById(item.id);
      if (targetElement) {
        fetch(item.path)
          .then((response) => {
            if (!response.ok) {
              throw new Error(`Could not fetch ${item.path}`);
            }
            return response.text();
          })
          .then((data) => {
            targetElement.innerHTML = data;
          })
          .catch((error) => {
            console.error(`Error loading content for ID '${item.id}':`, error);
          });
      }
    });
  }

  // Set up click listeners for the navbar
  function setupNavbarListeners(pages) {
    document.addEventListener('click', (event) => {
      const link = event.target.closest('a[data-id]');
      if (link) {
        event.preventDefault();
        const pageId = link.getAttribute('data-id');
        loadPageContent(pageId, pages);
        setActiveLink(pageId);
        closeNavbarOnMobile();
      }
    });
  }

  // Load page content dynamically into the main container
  function loadPageContent(pageId, pages) {
    const page = pages.find((p) => p.id === pageId);
    if (page) {
      fetch(page.path)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Could not fetch ${page.path}`);
          }
          return response.text();
        })
        .then((content) => {
          const mainContent = document.getElementById('main_content');
          if (mainContent) {
            mainContent.innerHTML = content;

            // When switching pages, reload content that belongs on the new page
            if (contentData) {
              loadContentByIdFromJSON(contentData.projects);
              loadContentByIdFromJSON(contentData.blogPosts);
            }
          }
        })
        .catch((error) => {
          console.error(`Error loading page ${pageId}:`, error);
        });
    } else {
      console.error(`Page with ID '${pageId}' not found.`);
    }
  }

  // Highlight the active link in the navbar
  function setActiveLink(activeId) {
    const links = document.querySelectorAll('.nav-link');
    links.forEach((link) => {
      const linkId = link.getAttribute('data-id');
      if (linkId === activeId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  // Close navbar automatically on mobile
  function closeNavbarOnMobile() {
    const navbarCollapse = document.querySelector('.navbar-collapse');
    if (navbarCollapse && navbarCollapse.classList.contains('show')) {
      const collapseInstance = bootstrap.Collapse.getInstance(navbarCollapse);
      collapseInstance.hide();
    }
  }
});
