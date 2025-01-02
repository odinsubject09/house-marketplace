import React from 'react'
import { useState, useEffect } from 'react'
import { getAuth, updateProfile } from 'firebase/auth'
function Profile() {
  const auth=getAuth()
  
  return (
    <div>
        <h1>
            Profile
        </h1>
    </div>
  )
}

export default Profile