<template>
  <q-page class="flex flex-center">
    <div style="max-width: 600px">
      <div v-if="submitted === false && editing === false && showProtocol === false">
        <div class="column items-center" v-if="start === true">
          <div class="col">
            <h2 class="yale-title">Patient Registration</h2>
          </div>
          <div class="col items-center">
            <q-input clearable square outlined color="blue-12" v-model="form.firstname" id="firstname" label="First Name *" lazy-rules
              :rules="[ val => val && val.length > 0 || 'Please type your first name']"></q-input>
            <q-input clearable square outlined color="blue-12" v-model="form.lastname" id="lastname" label="Last Name *" lazy-rules
              :rules="[ val => val && val.length > 0 || 'Please type your last name']"></q-input>
            <q-input clearable square outlined color="blue-12" v-model="form.examiner" id="examiner" label="Examiner Name *" lazy-rules
              :rules="[ val => val && val.length > 0 || 'Please type the examiner name']"></q-input>
          </div>
          <div class="row q-gutter-sm">
            <div class="q-gutter-sm">
              <q-btn v-if="this.json !== null" @click="onStart" color="primary" label="Continue"/>
            </div>
          </div>
          <div class="row q-gutter-sm">
            <div class="q-gutter-sm">
              <q-btn to="/data" color="secondary" label="Show Data"/>
            </div>
            <div v-if="this.admin === true" class="q-gutter-sm">
              <q-btn @click="modifyJSON" color="secondary" label="Modify json for disorders"/>
            </div>
          </div>
        </div>

        <div class="column items-center" v-if="start === false">
          <div class="col">
            <h2 class="yale-title">Patient Diagnosis</h2>
          </div>
          <div class="col">
            <h4 class="body-font">{{json[disorder]['steps'][step]['question']}}</h4>
          </div>
          <div class="col">
            <p class="body-font" v-for="item in json[disorder]['steps'][step]['tips']" v-bind:key='item'>{{item}}</p>
          </div>
          <div class="row q-gutter-sm" v-if="this.videoNames[disorder][step] !== null">
            <div class="q-gutter-sm">
              <video style="max-width: 300px" controls autoplay v-if="typeof this.videoSrcs[this.disorder][this.step] !== 'undefined'">
                <source v-bind:src="videoSrcs[disorder][step]" type='video/mp4'>
              </video>
            </div>
          </div>
          <div class="row q-gutter-sm">
            <div v-if="this.json[disorder]['steps'][step]['yesButton']" class="q-gutter-sm">
              <q-btn @click="recordAnswer('yes');changeStep(json[disorder]['steps'][step]['nextTrue'],json)" label="Yes" to="" color="primary"/>
            </div>
            <div v-if="this.json[disorder]['steps'][step]['noButton']" class="q-gutter-sm">
              <q-btn @click="recordAnswer('no');changeStep(json[disorder]['steps'][step]['nextFalse'],json)" label="No" to="" color="primary"/>
            </div>
            <div class="q-gutter-sm">
              <q-btn @click="previous" label="Previous" to="" color="primary"/>
            </div>
             <div v-if="this.json[disorder]['steps'][step]['nextProtocol'] !== false" class="q-gutter-sm">
              <q-btn @click="toProtocol(json[disorder]['steps'][step]['nextProtocol'])" label="Go to Protocol" color="primary"/>
            </div>
            <div v-if="this.json[disorder]['steps'][step]['nextProtocol'] === false && this.json[disorder]['steps'][step]['nextSubmit'] === true" class="q-gutter-sm">
              <q-btn @click="onSubmit" label="Submit Form" color="secondary"/>
            </div>
            <div v-if="this.admin === true && this.json[disorder]['steps'][step]['editable']" class="q-gutter-sm">
              <q-btn @click="onEdit" label="Edit Video" color="secondary"/>
            </div>
          </div>
        </div>
      </div>

      <div v-if="submitted === false && editing === false && showProtocol === true">
        <div class="column items-center">
          <div class="col">
            <h2 class="text-weight-medium" style="color: #214570">{{json[disorder]['protocols'][protocol]['name']}}</h2>
          </div>
          <div class="col">
            <q-list>
              <q-item v-for="step in json[disorder]['protocols'][protocol]['steps']" v-bind:key='step'>
                <q-item-section class="body-font">
                  {{step['title']}}
                  <div v-if="step['tips'] !== null">
                    <q-item v-for="tip in step['tips']" v-bind:key='tip'>
                      <q-item-section class="body-font">
                        {{tip}}
                      </q-item-section>
                    </q-item>
                  </div>
                </q-item-section>
              </q-item>
            </q-list>
          </div>
          <div class="row q-gutter-sm">
            <div class="q-gutter-sm">
              <q-btn @click="onSubmit" label="Submit Form" color="primary" v-if="this.json[disorder]['steps'][step]['nextSubmit'] === true"/>
            </div>
          </div>
        </div>
      </div>

      <div v-if="submitted === true && editing === false && showProtocol === false">
        <div class="row q-gutter-sm">
          <div class="q-gutter-sm">
            <q-btn @click="resetForm" label="Fill out another form" color="primary"/>
          </div>
          <div class="q-gutter-sm">
            <q-btn to="/data" color="primary" label="Show Data"/>
          </div>
        </div>
      </div>

      <div v-show="editing === true && showProtocol === false">
        <div class="column items-center">
          <div class="q-pa-md">
            <div class="q-gutter-y-md">
              <q-btn @click="deleteVideo" label="Remove Current Video" color="secondary"/>
            </div>
          </div>
          <div class="col">
            <q-uploader :url="getUrl" accept="video/*" label="Add or Replace Video" style="max-width: 300px"/>
          </div>
          <div class="q-pa-md">
            <div class="q-gutter-y-md">
              <q-btn @click="onEdit" label="Done" color="secondary"/>
            </div>
          </div>
        </div>
      </div>

      <q-dialog v-model="prompt" persistent>
        <q-card style="min-width: 350px">
          <q-card-section>
            <div class="text-h6">Name of Disorder to Screen For</div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <q-select :options="disorders" v-model="disorder" style="width: 200px" label="Choose disorder"/>
          </q-card-section>

          <q-card-actions align="right" class="text-primary">
            <q-btn flat label="Cancel" v-close-popup />
            <q-btn flat label="Continue" @click="onStart" v-close-popup />
          </q-card-actions>
        </q-card>
      </q-dialog>

    </div>
  </q-page>
</template>

<script>
import localforage from 'localforage'

export default {
  name: 'PageForm',
  data () {
    return {
      admin: true,
      start: true,
      prompt: false,
      showProtocol: false,
      editing: false,
      submitted: false,
      onLine: navigator.onLine,
      backOnline: false,
      waitingToSend: false,
      json: null,
      videoNames: {},
      videoSrcs: {},
      disorder: '',
      disorders: [],
      step: 'Step 1',
      protocol: '',
      path: ['Step 1'],
      patientSummary: {},
      form: {
        firstname: '',
        lastname: '',
        examiner: '',
        responses: {}
      }
    }
  },
  methods: {
    /* updates online status when online */
    onOnline () {
      this.onLine = true
    },
    /* updates online status when offline */
    onOffline () {
      this.onLine = false
    },
    /* displays a protocol */
    toProtocol (protocol) {
      this.showProtocol = true
      this.protocol = protocol
    },
    /* stores value under name in local storage */
    store (name, value) {
      localforage.setItem(name, value, function () {
        console.log('Saved: ' + value + ' under name: ' + name)
      }).catch(function (err) {
        console.log(err)
      })
    },
    /* removes value stored under name from local storage */
    removeStored (name) {
      localforage.removeItem(name).then(function () {
        console.log('Cleared: ' + name + ' from localforage')
      }).catch(function (err) {
        console.log(err)
      })
    },
    /* toggles editing page */
    onEdit () {
      if (this.editing) {
        this.getVideo(this.disorder, this.step)
        this.editing = false
      } else if (this.onLine === true) {
        this.editing = true
      } else {
        this.$q.notify({
          message: 'Cannot edit app while offline.',
          color: 'black'
        })
      }
    },
    /* begins disorder screening */
    onStart () {
      if (this.disorder === '' && this.prompt === false) {
        this.disorders = Object.keys(this.json)
        if (this.onLine !== true) {
          /* if offline gets video names object from local storage */
          localforage.getItem('videos').then((value) => {
            this.videoNames = value
            /* gets videos for every step for every disorder in json */
            for (var disorder of Object.keys(this.json)) {
              for (var step of Object.keys(this.json[disorder].steps)) {
                this.getVideo(disorder, step)
              }
            }
          }).catch(console.log.bind(console))
        } else {
          /* gets videos for every step for every disorder in json */
          for (var disorder of Object.keys(this.json)) {
            for (var step of Object.keys(this.json[disorder].steps)) {
              this.getVideo(disorder, step)
            }
          }
        }
      }

      /* asks user which disorder to screen for */
      if (this.disorder !== '') {
        this.start = false
      } else {
        this.prompt = true
      }
    },
    /* if online sends user to page to modify json used by the app */
    modifyJSON () {
      if (this.onLine === true) {
        window.location.href = window.location.href + 'modifyJSON'
      } else {
        this.$q.notify({
          message: 'Cannot edit app while offline.',
          color: 'black'
        })
      }
    },
    /* url for video upload */
    getUrl (files) {
      return `https://fierce-savannah-61378.herokuapp.com/uploadVideo?disorder=${this.disorder}&step=${this.step}`
    },
    /* saves video to local storage */
    saveVideo (url, disorder, step, tmp) {
      console.log('saving video: ' + url + ' to local storage')
      /* get name of video previously assigned to this step */
      const previousVideo = tmp.videoNames[disorder][step]

      const tmpURL = new URL(url)
      const name = tmpURL.pathname.replace(/\//g, '')

      localforage.getItem(name).then((value) => {
        if (value === null) { /* video does not yet exist in local storage */
          /* only want to get video from s3 bucket if it isn't already saved */
          fetch(url).then(function (response) {
            return response.blob()
          }).then(function (blob) {
            /* remove old video from local storage */
            if (typeof previousVideo !== 'undefined' && previousVideo !== null) {
              tmp.removeStored(previousVideo)
            }
            /* add new video to local storage */
            tmp.store(name, blob)

            /* modify object of video names */
            tmp.videoNames[disorder][step] = name

            /* have to do it this way to work on android */
            const bloburl = window.URL.createObjectURL(blob)
            var xhr = new XMLHttpRequest()
            xhr.open('get', bloburl)
            xhr.responseType = 'blob'
            xhr.onload = function () {
              var newblob = xhr.response
              /* this will be a valid blob URI for an <q-video> tag */
              tmp.videoSrcs[disorder][step] = URL.createObjectURL(newblob)
            }
            xhr.send()
          })
        } else {
          tmp.videoNames[disorder][step] = name
          /* have to do it this way to work on android */
          const bloburl = window.URL.createObjectURL(value)
          var xhr = new XMLHttpRequest()
          xhr.open('get', bloburl)
          xhr.responseType = 'blob'
          xhr.onload = function () {
            var newblob = xhr.response
            /* this will be a valid blob URI for an <q-video> tag */
            tmp.videoSrcs[disorder][step] = URL.createObjectURL(newblob)
          }
          xhr.send()
        }
      }).catch(console.log.bind(console))
    },
    /* gets video from local storage */
    getSavedVideo (name, disorder, step) {
      localforage.getItem(name).then((blob) => {
        /* have to do it this way to work on android */
        const bloburl = window.URL.createObjectURL(blob)
        var xhr = new XMLHttpRequest()
        xhr.open('get', bloburl)
        xhr.responseType = 'blob'
        xhr.onload = function () {
          var newblob = xhr.response
          /* this will be a valid blob URI for an <q-video> tag */
          this.videoSrcs[disorder][step] = URL.createObjectURL(newblob)
        }
        xhr.send()
      }).catch((err) => {
        console.log(err)
      })
    },
    /* gets json text from database given json id */
    getJsonText: async function (id) {
      const url = new URL('https://fierce-savannah-61378.herokuapp.com/getJson')
      url.searchParams.append('id', id)
      const result = await fetch(url).catch((error) => { console.log(error) })
      const data = await result.json()
      this.json = JSON.parse(data[0].text)
      this.store(id, data[0].text)
      this.store('json', id)
    },
    /* gets json id from database */
    getJson: async function () {
      if (this.onLine === true) {
        const url = new URL('https://fierce-savannah-61378.herokuapp.com/modifyJson')
        const result = await fetch(url).catch((error) => { console.log(error) })
        const data = await result.json()
        if (data.length !== 0) {
          localforage.getItem(data[0].id).then((value) => {
            if (!value) {
              this.getJsonText(data[0].id)
            } else {
              this.json = JSON.parse(value)
            }
          })
        } else {
          console.log('Error: no json found')
        }
      } else {
        localforage.getItem('json').then((value) => {
          localforage.getItem(value).then((text) => {
            this.json = JSON.parse(text)
          })
        }).catch(console.log.bind(console))
      }
    },
    /* gets video url from database */
    getVideo: async function (disorder, step) {
      console.log('getting video for disorder: ' + disorder + ' and step: ' + step)
      if (typeof this.videoNames[disorder] === 'undefined') {
        this.videoNames[disorder] = {}
      }

      if (typeof this.videoSrcs[disorder] === 'undefined') {
        this.videoSrcs[disorder] = {}
      }

      if (this.onLine === true) {
        const url = new URL('https://fierce-savannah-61378.herokuapp.com/videos')
        url.searchParams.append('disorder', disorder)
        url.searchParams.append('step', step)
        const result = await fetch(url).catch((error) => { console.log(error) })
        const data = await result.json()
        if (data.length !== 0) {
          this.saveVideo(data[0].url, disorder, step, this)
        } else {
          console.log('No video for disorder: ' + disorder + ' and step: ' + step)
          this.videoNames[disorder][step] = null
          this.videoSrcs[disorder][step] = null
        }
        this.store('videos', this.videoNames)
      } else {
        if (typeof this.videoNames[disorder][step] !== 'undefined' && this.videoNames[disorder][step] !== null) {
          this.getSavedVideo(this.videoNames[disorder][step], disorder, step)
        }
      }
    },
    /* deletes video from database and archives video in s3 bucket */
    deleteVideo: async function () {
      if (!this.videoNames[this.disorder][this.step]) {
        this.$q.notify({
          message: 'There is no video to delete.',
          color: 'black'
        })
      } else {
        const url = new URL('https://fierce-savannah-61378.herokuapp.com/deleteVideo')
        url.searchParams.append('disorder', this.disorder)
        url.searchParams.append('step', this.step)
        url.searchParams.append('videoName', this.videoNames[this.disorder][this.step])
        const result = await fetch(url).catch((error) => { console.log(error) })
        const data = await result.json()
        console.log(data)
        const previous = this.videoNames[this.disorder][this.step]
        this.removeStored(previous)
        this.videoNames[this.disorder][this.step] = null
        this.videoSrcs[this.disorder][this.step] = null
      }
    },
    /* sends patient data to database */
    sendForm: async function () {
      console.log(this.form)
      this.patientSummary.patient_firstName = this.form.firstname
      this.patientSummary.patient_lastName = this.form.lastname
      this.patientSummary.disorder = this.disorder
      this.patientSummary.responses = JSON.stringify(this.form.responses)
      this.patientSummary.examiner = this.form.examiner

      const url = new URL('https://fierce-savannah-61378.herokuapp.com/patients')

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          patient_firstName: this.patientSummary.patient_firstName,
          patient_lastName: this.patientSummary.patient_lastName,
          disorder: this.patientSummary.disorder,
          responses: this.patientSummary.responses,
          examiner: this.patientSummary.examiner
        })
      }).catch((error) => { console.log(error) })
      const data = await response.json()
      if (typeof data.status !== 'undefined') { // occurs when status is 400
        throw new Error(data.message.reason)
      }
    },
    /* sends data to database if there is internet connection and otherwise saves the data locally */
    onSubmit () {
      if (this.onLine) {
        this.sendForm()
        this.removeStored('waitingToSend')
        this.removeStored('form')
      } else {
        const parsedform = JSON.stringify(this.form)
        this.store('form', parsedform)
        this.waitingToSend = true
        const parsedwaitingToSend = JSON.stringify(this.waitingToSend)
        this.store('waitingToSend', parsedwaitingToSend)
        this.$q.notify({
          message: 'App offline. Will upload data when connection is back.',
          color: 'black'
        })
      }
      this.submitted = true
      this.showProtocol = false
    },
    /* resets form data to initial state -- erases data collected in session so far */
    resetForm () {
      this.start = true
      this.editing = false
      this.showProtocol = false
      this.submitted = false
      this.disorder = ''
      this.step = 'Step 1'
      this.path = ['Step 1']
      this.patientSummary = { }
      this.form = {
        firstname: '',
        lastname: '',
        examiner: '',
        responses: {}
      }
    },
    /* records the answer to a given step */
    recordAnswer (answer) {
      this.form.responses[this.step] = answer
    },
    /* changes to the next step */
    changeStep (newStep, json) {
      console.log('changing step to step ' + newStep)
      this.path.push(newStep) /* saves step order in path */
      this.step = newStep
    },
    /* goes back to previous step */
    previous () {
      if (this.step === 'Step 1') {
        this.start = true
        this.resetForm()
      } else {
        const last = this.path[this.path.length - 2]
        console.log('changing step to step ' + last)
        this.path.pop(last)
        this.form.responses[last] = null
        if (this.step === 'Step 1') {
          this.step = 'Step 1'
        } else { this.step = last }
      }
    }
  },
  mounted () {
    document.addEventListener('offline', this.onOffline, false)
    document.addEventListener('online', this.onOnline, false)

    /* get any buffered patient data to submit */
    localforage.getItem('form').then((value) => {
      if (value) {
        this.form = JSON.parse(value)
      }
    }).catch(console.log.bind(console))

    /* uploads buffered patient data to database if connected to internet */
    localforage.getItem('waitingToSend').then((value) => {
      if (value) {
        this.waitingToSend = JSON.parse(value)
        if (this.onLine === true & this.waitingToSend === true) {
          this.waitingToSend = false
          this.onSubmit()
          this.$q.notify({
            message: 'App back online. Uploading data.',
            color: 'black'
          })
          const parsedwaitingToSend = JSON.stringify(this.waitingToSend)
          this.store('waitingToSend', parsedwaitingToSend)
        }
      }
    }).catch(console.log.bind(console))

    /* get disorder json from either database or local storage */
    this.getJson()
  },
  watch: {
    onLine (v) {
      if (v) {
        this.backOnline = true
        if (this.waitingToSend === true) {
          this.$q.notify({
            message: 'App back online. Uploading data.',
            color: 'black'
          })
          this.waitingToSend = false
          this.onSubmit()
        }
        setTimeout(() => { this.backOnline = false }, 1000)
      }
    }
  },
  beforeDestroy () {
    document.removeEventListener('offline', this.onOffline, false)
    document.removeEventListener('online', this.onOnline, false)
  }
}
</script>
