# mhGAP Diagnostic Tool

A tablet application to be used by primary care workers in Nigeria to screen for mental, neurological, and substance use (MNS) disorders. This application uses the protocols for clinical decision-making designed for non-specialized healthcare providers found in the World Health Organization’s (WHO) Mental Health Gap Action Programme (mhGAP) Intervention Guide Version 2.0, which is available [here](https://www.who.int/publications-detail/mhgap-intervention-guide---version-2.0). The mhGAP Intervention Guide includes flowcharts to assist in clincal assessment, and the questions and tips in the flowcharts are represented in the application as a json file.

## Resources Used
* [Quasar Framework](https://quasar.dev/)
* [Vue.js](https://vuejs.org/)
* [Cordova](https://cordova.apache.org/)
* [LocalForage](https://github.com/localForage/localForage)
* [Express](https://expressjs.com/)
* [Node.js](https://nodejs.org/en/)
* [MySQL](https://www.mysql.com/)
* [AWS S3](https://aws.amazon.com/s3/)


## Hosting

An administrative version is available on Heroku at

```
https://mhgap-admin.herokuapp.com/
```
The administrative version allows you to insert video to be displayed on the pages of the application through the edit page. It also allows you to generate json that corresponds to a flowchart for a disorder from the World Health Organization's mhGap Intervention Guide.

A non-administrative version is available on Heroku at 

```
https://mhgap.herokuapp.com/
```
## Getting Started

These instructions will help you get the project up and running on your local machine for development and testing purposes.

### Prerequisites

Clone the repository

```
$ git clone https://github.com/isabellecarson/mh-gap.git
```

Install the dependencies
```
$ cd mh-gap
$ npm install
```

If Quasar is not installed globally:
```
$ npm install -g quasar
```

If Cordova is not installed globally:
```
$ npm install -g cordova
```

For running on android:
```
$ quasar mode add cordova
$ cd src-cordova
$ cordova add platform android
$ cordova build
```

### Running the Application in Development Mode

For running on your local machine:

```
$ quasar dev
```

For running on a connected android device:

```
$ quasar dev -m cordova -T android
```

### Build the Application for Production

```
$ quasar build
```
Once built, the application can be deployed to Heroku, if wanted.
