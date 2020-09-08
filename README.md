[![Netlify Status](https://api.netlify.com/api/v1/badges/6abecf5a-8e9f-4b9e-818d-ed47c21ef863/deploy-status)](https://app.netlify.com/sites/howbusyismytrain/deploys)

## How busy is my train

This site shows an estimate for how busy a trip on the mta is 

### Methodology 

### Developing 

To develop the app locally run 

```bash
yarn
yarn start 
```

Submit PR's to the develop branch.

### Deploying 

Master and develop branches are automatically deployed

- Master: [https://howbusyismytrain.tsdataclinic.com/](https://howbusyismytrain.tsdataclinic.com/)
- Develop: [https://develop--howbusyismytrain.netlify.app/](https://develop--howbusyismytrain.netlify.app/)

In addition, pull requests will be available for preview at URLS with the pattern [https://deploy-preview-{PR_Number}--howbusyismytrain.netlify.app/](https://deploy-preview-{PR_Number}--howbusyismytrain.netlify.app/)