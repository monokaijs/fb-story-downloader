(() => {
  console.log("Interceptor loaded...");
  const serialize = function(obj, prefix) {
    let str = [],
      p;
    for (p in obj) {
      if (obj.hasOwnProperty(p)) {
        let k = prefix ? prefix + "[" + p + "]" : p,
          v = obj[p];
        str.push((v !== null && typeof v === "object") ?
          serialize(v, k) :
          encodeURIComponent(k) + "=" + encodeURIComponent(v));
      }
    }
    return str.join("&");
  }
  const getQueryValue = (name, query) => {
    let raw = query.includes('?') ? query.split('?')[1] : query;
    let parts = raw.split('&');
    let parsedObject = {};
    parts.forEach(part => {
      if (part.includes('=')) parsedObject[part.split('=')[0]] = part.split('=')[1];
    });
    // console.log(parsedObject);
    return parsedObject[name];
  }

  let lastStorySeenRequestData = null;

  (function (xhr) {
    let
      proto = xhr.prototype,
      _send = proto.send,
      _open = proto.open;

    // overload open() to access url and request method
    proto.open = function () {
      // store type and url to use in other methods
      this._method = arguments[0];
      this._url = arguments[1];
      if (this._method.toLowerCase() === 'post' && this._url === '/api/graphql/') {
        this._isGraphQL = true;
      }
      _open.apply(this, arguments);
    };

    proto.send = function () {
      if (this._isGraphQL) {
        const friendlyName = getQueryValue('fb_api_req_friendly_name', arguments[0]);
        if (friendlyName === 'storiesUpdateSeenStateMutation') lastStorySeenRequestData = arguments[0];
      }
      _send.apply(this, arguments);
    };
  })(XMLHttpRequest);

  window.addEventListener('request-download-story', e => {
    const variables = getQueryValue('variables', lastStorySeenRequestData);
    if (variables) {
      const object = JSON.parse(decodeURIComponent(variables));
      const bucketId = object.input['bucket_id'];
      const storyId = object.input['story_id'];
      fetch('https://www.facebook.com/api/graphql/', {
        method: 'POST',
        headers: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        body: serialize({
          doc_id: '2913003758722672',
          variables: JSON.stringify({
            'bucketIDs': [bucketId],
            'scale': 1,
            'prefetchPhotoUri': false,
          }),
          fb_dtsg: require('DTSGInitialData').token,
          server_timestamps: true,
        }),
      }).then(r => r.json()).then(response => {
        if (response && response.data && response.data.nodes && response.data.nodes[0]) {
          const bucket = response.data.nodes[0];
          const stories = bucket['unified_stories']['edges'];
          const storyToDownload = stories.find(story => {
            return story.node['id'] === storyId
          });
          if (storyToDownload) {
            const story = storyToDownload.node;
            const attachments = story['attachments'];
            attachments.forEach(attachment => {
              let url;
              if (attachment.media['__typename'] === "Photo") {
                url = attachment.media['image']['uri'];
              } else if (attachment.media['__typename'] === "Video") {
                url = attachment.media['playable_url_quality_hd'] || attachment.media['playable_url'];
              }
              const anchor = document.createElement('a');
              anchor.href = url;
              anchor.download = url.split('#').shift().split('?').shift().split('/').pop();
              anchor.target = "_blank";
              document.body.appendChild(anchor);
              anchor.click();
              document.body.removeChild(anchor);
            });
          } else {
            console.log("Failed to find your wanted story.")
          }
        }
      });
    }
  });

})();
