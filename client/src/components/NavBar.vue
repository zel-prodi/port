<template>
    <div>
     <v-app-bar
      dense
      flat
      color="white"
    >
    <!-- {{userInfo.username}} -->
        <v-app-bar-nav-icon @click.stop="mini = !mini"></v-app-bar-nav-icon>

        <v-toolbar-title> <h4 class="font-weight-light">{{ $t(titlePage) }} </h4> </v-toolbar-title>
        <v-spacer></v-spacer>
        <LanguageSwitcher />
        <!-- <v-btn icon><v-icon>mdi-exit-to-app</v-icon></v-btn> -->
        <!-- <v-btn small text><v-icon small>mdi-account</v-icon><span class="overline ml-1">Username</span></v-btn> -->


        <v-menu offset-y>
            <template v-slot:activator="{ on }">
                <v-btn v-on="on" small text><v-icon small>mdi-account</v-icon><span class="overline ml-1">{{userInfo.username}}</span></v-btn>
            </template>

            <v-list>
                <v-list-item
                    @click="myAccountDialog = true"
                >
                    <v-icon class="mr-2">mdi-account-circle</v-icon>
                    <v-list-item-title>{{ $t('My Account') }}</v-list-item-title>
                </v-list-item>

                <v-list-item
                    @click="changePasswordDialog = true"
                >
                    <v-icon class="mr-2">mdi-key</v-icon>
                    <v-list-item-title>{{ $t('Change Password') }}</v-list-item-title>
                </v-list-item>

                <v-list-item
                    @click="logout()"
                >
                    <v-icon class="mr-2">mdi-exit-to-app</v-icon>
                    <v-list-item-title>{{ $t('Logout') }}</v-list-item-title>
                </v-list-item>
            </v-list>
        </v-menu>
    </v-app-bar>
    <v-divider></v-divider>

    <v-navigation-drawer
      v-model="drawer"
      :mini-variant.sync="mini"
      permanent
      app
      class="pa-0 ma-0"
    >
        <v-list-item dense class="px-2">
            <v-list-item-avatar class="mb-1 mt-1">  
                <v-img src="/gcLogo.jpg"></v-img>
            </v-list-item-avatar>

            <v-list-item-title class="overline">{{ $t('GC Portal System') }}</v-list-item-title>

            <!-- <v-btn
            icon
            @click.stop="mini = !mini"
            >
            <v-icon>mdi-chevron-left</v-icon>
            </v-btn> -->
        </v-list-item>

      <v-divider></v-divider>

      <v-list>
        <v-list-item
          v-for="item in mainNavigationItems"
          :key="item.title"
          link
            :to="item.to"
        >
          <v-list-item-icon>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title class="overline">{{ $t(item.title) }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>

      
       

      <v-list v-if="userInfo.account_type === 'HRD Admin'">
             <v-list-item-content>
          <v-list-item-title class="title font-weight-light ml-2">
            {{$t('Master Settings')}}
          </v-list-item-title>
        </v-list-item-content>
        <v-divider></v-divider>
        <v-list-item
            v-for="item in masterNavigationItems"
            :key="item.title"
            link
            :to="item.to"
        >
          <v-list-item-icon>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title class="overline">{{ $t(item.title) }}</v-list-item-title>
          </v-list-item-content>  
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- DIALOGS -->
    <!-- MY ACCOUNT DIALOG -->
    <v-dialog
      v-model="myAccountDialog"
      max-width="350"
      persistent
    >
        <v-card>
            <v-card-title class="font-weight-light">{{ $t('My Account') }}</v-card-title>
            <v-simple-table>
                <template v-slot:default>
                        <tr>
                            <th class="text-left ma-0">{{ $t('Name') }}</th>
                            <td class="text-left">{{userInfo.first_name}}  {{userInfo.last_name}}</td>
                        </tr>

                        <tr>
                            <th>{{ $t('Username') }}</th>
                            <td>{{userInfo.username}}</td>
                        </tr>

                        <tr>
                            <th>{{ $t('Company Group') }}</th>
                            <td>{{userInfo.company_group}}</td>
                        </tr>

                        <tr>
                            <th>{{ $t('Account Status') }}</th>
                            <td>{{userInfo. account_status}}</td>
                        </tr>

                        <tr>
                            <th>{{ $t('Account Type') }}</th>
                            <td>{{ userInfo.account_type}}</td>
                        </tr>

                        <tr>
                            <th>{{ $t('Date Registered') }}</th>
                            <td>{{userInfo.date_registered}}</td>
                        </tr>
                        
                </template>
            </v-simple-table>

            
            <v-card-actions>
                <v-spacer></v-spacer>

                <v-btn
                    color="red darken-1"
                    outlined
                    @click="myAccountDialog = false"
                >
                    {{ $t('Back') }}
                </v-btn>

            </v-card-actions>
        </v-card>
    </v-dialog>

    <!-- CHANGE PASSWORD DIALOG -->
    <v-dialog
      v-model="changePasswordDialog"
      max-width="350"
      persistent
    >
        <v-card>
            <v-card-title class="font-weight-light">{{ $t('Change Password') }}</v-card-title>

            <v-alert class="ma-2" v-model="alert" dense outlined type="error" >
                <p class="overline">{{errorMessage}}</p>
            </v-alert>

            <v-form class="pa-2">
                <v-text-field
                    dense
                    outlined
                    v-model="oldPassword"
                    :value="oldPassword"
                    :label="$t('Old Password')"
                    :append-icon="value ? 'mdi-eye' : 'mdi-eye-off'"
                    @click:append="() => (value = !value)"
                    :type="value ? 'password' : 'text'"
                ></v-text-field>

                <v-text-field
                    dense
                    outlined
                    v-model="newPassword"
                    :label="$t('New Password')"
                ></v-text-field>

                <v-text-field
                    dense
                    outlined
                    v-model="confirmPassword"
                    :label="$t('Confirm Password')"
                ></v-text-field>
            </v-form>

            <v-card-actions>
                <v-spacer></v-spacer>

                <v-btn
                    color="red darken-1"
                    outlined
                    @click="cancelChangePassword()"
                >
                    {{ $t('Cancel') }}
                </v-btn>

                <v-btn
                    color="blue darken-1"
                    outlined
                    @click="changePassword()"
                >
                    {{ $t('Change Password') }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
        
    </div>
</template>

<script>
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
export default {
    components:{
        LanguageSwitcher
    },
    data(){
        return{
            value:String,
            drawer: true,
            mainNavigationItems: [
            { title: 'mainNavigationItems.Tsuutatsu', icon: 'mdi-file-star', to:'TsuutatsuPage'},
            { title: 'mainNavigationItems.Ringi', icon: 'mdi-file-compare', to:'RingiPage'},
            { title: 'mainNavigationItems.Kanren', icon: 'mdi-file-chart-outline', to:'KanrenPage ' },
            ],
            masterNavigationItems: [
            { title: 'masterNavigationItems.User Accounts', icon: 'mdi-account-multiple', to:'UserAccountsMasterSettings'},
            { title: 'masterNavigationItems.Category', icon: 'mdi-cog-box', to:'TsuutatsuRulesCategory'},
            // { title: 'Users', icon: 'mdi-account-group-outline' },
            ],
            mini: false,

            oldPassword: '',
            newPassword: '',
            confirmPassword: '',

            myAccountDialog: false,
            changePasswordDialog: false,
            alert:false,
            errorMessage: ''

        //      items: [
        // { title: 'My Account', icon:'mdi-account-circle' },
        // { title: 'Change Password', icon: 'mdi-key' },
        // { title: 'Logout', icon: 'mdi-exit-to-app', to:'/SignIn' },
    //   ],
        }
    },
    methods: {
        // tets(){
        //     alert('test')
        // },
        logout(){
            let conf = confirm('Are you sure you want to LOGOUT?')
            if(conf === true){
                this.$router.push('SignIn')
                this.$store.commit('USER_INFO', {})
            }else{
                console.log('Logout Cancelled')
            }
        },
        cancelChangePassword(){
            this.oldPassword = "";
            this.newPassword = "";
            this.confirmPassword = "";
            this.alert = false;
            this.changePasswordDialog = false;
        },
        changePassword(){
            
            if(this.newPassword === this.confirmPassword){
                alert("Password Changed")
            }else{
                this.alert = true
                this.errorMessage = "Password not matched."
            }
        }
    }
}
</script>
