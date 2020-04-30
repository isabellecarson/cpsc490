<template>
  <q-page class="flex flex-center">
    <div class="column items-center">
      <div class="col">
        <h2 class="yale-title">Patient Data</h2>
      </div>

      <div class="col">
        <q-table v-if="patients"
          :data="patients"
          :columns="columns"
          row-key="name">
          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn dense round flat color="grey" @click="deleteRow(props)" icon="delete"></q-btn>
            </q-td>
          </template>
        </q-table>
      </div>

      <div class="row justify-center q-gutter-sm">
        <div class="q-gutter-sm">
          <q-btn label="Refresh Data" @click="getData" color="primary"/>
        </div>
        <div class="q-gutter-sm">
          <q-btn to="/" label="Go to App Home" color="primary"/>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import moment from 'moment'
import localforage from 'localforage'

export default {
  name: 'PageData',
  data () {
    return {
      onLine: navigator.onLine,
      backOnline: false,
      waitingToLoadData: false,
      patients: null,
      admin: false,
      columns: [
        {
          name: 'patient_firstName',
          label: 'First Name',
          field: row => row.patient_firstName
        },
        {
          name: 'patient_lastName',
          label: 'Last Name',
          field: row => row.patient_lastName
        },
        {
          name: 'disorder',
          label: 'Disorder',
          field: row => row.disorder
        },
        {
          name: 'responses',
          label: 'Responses',
          field: row => row.responses
        },
        {
          name: 'Examiner',
          label: 'Examiner Name',
          field: row => row.examiner
        },
        {
          name: 'submit_date',
          label: 'Date',
          field: row => moment(String(row.submit_date)).format('MM/DD/YYYY hh:mm')
        }]
    }
  },
  methods: {
    onOnline () {
      this.onLine = true
    },
    onOffline () {
      this.onLine = false
    },
    store (name, value) {
      localforage.setItem(name, value, function () {
        console.log('Saved: ' + value + ' under name: ' + name)
      }).catch(function (err) {
        console.log(err)
      })
    },
    removeStored (name) {
      localforage.removeItem(name).then(function () {
        console.log('Cleared: ' + name + ' from localforage')
      }).catch(function (err) {
        console.log(err)
      })
    },
    deleteRow: async function (props) {
      if (this.onLine === false) {
        this.$q.notify({
          message: 'Cannot edit app while offline.',
          color: 'black'
        })
      } else {
        const url = new URL('https://fierce-savannah-61378.herokuapp.com/deletePatient')
        url.searchParams.append('id', props.row.id)
        const result = await fetch(url).catch((error) => { console.log(error) })
        const data = await result.json()
        console.log(data)
        this.$q.notify({
          message: 'Row deleted.',
          color: 'black'
        })
        this.getData()
      }
    },
    /* gets patient data from database if online or local storage if offline */
    getData: async function () {
      if (this.onLine) {
        const url = new URL('https://fierce-savannah-61378.herokuapp.com/patients')
        const result = await fetch(url).catch((error) => { console.log(error) })
        const data = await result.json()
        this.patients = data
        this.store('patients', data)
      } else {
        this.waitingToLoadData = true
        const parsedwaitingToLoadData = JSON.stringify(this.waitingToLoadData)
        this.store('waitingToLoadData', parsedwaitingToLoadData)
        localforage.getItem('patients').then((value) => {
          if (value !== null) {
            this.patients = JSON.parse(value)
          }
        }).catch(console.log.bind(console))
        this.$q.notify({
          message: 'App offline. Will load recent data when connection is back.',
          color: 'black'
        })
      }
      const parsedpatients = JSON.stringify(this.patients)
      this.store('patients', parsedpatients)
    }
  },
  mounted () {
    document.addEventListener('offline', this.onOffline, false)
    document.addEventListener('online', this.onOnline, false)
    this.getData()
    if (this.admin === true) {
      this.columns.push({
        name: 'actions',
        label: 'Actions',
        field: '',
        align: 'center'
      })
    }
  },
  watch: {
    onLine (v) {
      if (v) {
        this.backOnline = true
        if (this.waitingToLoadData === true) {
          this.$q.notify({
            message: 'App back online. Loading patient data.',
            color: 'black'
          })
          this.waitingToLoadData = false
          this.getData()
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
