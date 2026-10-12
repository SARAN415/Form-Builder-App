import React,{useState} from 'react'
import '../Style/DatabaseDialogBox.css'

function DatabaseDialogBox({ 
     showAlert,
     setShowDatabaseDialog,
     databaseConfig, 
     setDatabaseConfig, 
     onClose, 
     onSuccess 
}) {
    
    const [errors, setErrors] = useState({});
    const [testing, setTesting] = useState(false);

    const validate = () => {

        const newErrors = {};

        const {
            databaseType,
            url,
            databaseName,
            driverClassName,
            username,
            password
        } = databaseConfig;

        // Database type
        if (!databaseType) {

            newErrors.databaseType =
                "Please select a database type.";

        }

        // URL
        if (!url || !url.trim()) {

            newErrors.url =
                "Connection URL is required.";

        }

        // Username
        if (!username || !username.trim()) {

            newErrors.username =
                "Username is required.";

        }

        // Password
        if (
            databaseType !== "H2" &&
            (!password || !password.trim())
        ) {

            newErrors.password =
                "Password is required.";

        }

        // SQL databases
        if (
            databaseType === "MYSQL" ||
            databaseType === "POSTGRESQL" ||
            databaseType === "H2"
        ) {

            if (
                !driverClassName ||
                !driverClassName.trim()
            ) {

                newErrors.driverClassName =
                    "Driver class name is required.";

            }
        }

        // MongoDB
        if (
            databaseType === "MONGODB"
        ) {

            if (
                !databaseName ||
                !databaseName.trim()
            ) {

                newErrors.databaseName =
                    "Database name is required.";

            }
        }

        setErrors(newErrors);

        return (
            Object.keys(newErrors).length === 0
        );
    };

    const testConnection = async () => {

        if (!validate()) {
            return;
        }


        setTesting(true);

        const token = localStorage.getItem("accessToken");


        try {

            const response =
                await fetch(
                    "http://localhost:8080/api/forms/test",
                    {
                        method: "POST",
                        
                        headers: {
                            "Content-Type": "application/json",
                            ...(token
                                ? {
                                    Authorization: `Bearer ${token}`
                                }
                                : {})
                        },

                        body:
                            JSON.stringify(
                                databaseConfig
                            )
                    }
                );

            const message =
                await response.text();

            if (!response.ok) {

                throw new Error(
                    message ||
                    "Database connection failed."
                );
                //showAlert("error","Error",message||"Database connection failed");
            }

            alert(
                "Database connection successful."
            );
            //showAlert("success","Success","Database connection successful");

            // Continue only after successful authentication
            if (onSuccess) {
                onSuccess();
            }

        } catch (error) {

            console.error(
                "DATABASE CONNECTION ERROR:",
                error
            );

            setErrors({
                connection:
                    error.message ||
                    "Unable to connect to database."
            });

        } finally {

            setTesting(false);
        }
    };

    const handleDatabaseTypeChange =(e) => {

            const databaseType =
                e.target.value;


            setDatabaseConfig({
                ...databaseConfig,

                databaseType,

                // Clear fields that don't
                // apply to selected database
                databaseName:
                    databaseType === "MONGODB"
                        ? databaseConfig.databaseName
                        : "",

                driverClassName:
                    databaseType === "MYSQL"
                        ? "com.mysql.cj.jdbc.Driver"

                        : databaseType ===
                          "POSTGRESQL"
                            ? "org.postgresql.Driver"

                            : databaseType ===
                              "H2"
                                ? "org.h2.Driver"

                                : ""
            });


            setErrors({});
        };


    const urlPlaceholders = {
        MYSQL: "jdbc:mysql://localhost:3306/formdb",
        POSTGRESQL: "jdbc:postgresql://localhost:5432/formdb",
        H2: "jdbc:h2:file:./data/formdb",
        MONGODB: "mongodb://localhost:27017"
    };

    const driverPlaceholders = {
        MYSQL: "com.mysql.cj.jdbc.Driver",
        POSTGRESQL: "org.postgresql.Driver",
        H2: "org.h2.Driver",
        MONGODB: ""
    };
  return (
    <div className="database-dialog-overlay">

                <div className="database-dialog">

                    <div className="database-dialog-header">
                        <h3>Database Configuration</h3>

                        <button
                            className="database-dialog-close"
                            onClick={() =>
                                setShowDatabaseDialog(false)
                            }
                        >
                            ×
                        </button>
                    </div>


                    <div className="database-dialog-body">
                        <div className="database-field">

                            <label>
                                Database Type
                            </label>

                            <select
                                className="database-control"
                                value={databaseConfig.databaseType}
                                // onChange={(e) => {
                                //     const databaseType = e.target.value;

                                //     setDatabaseConfig(prev => ({
                                //         ...prev,
                                //         databaseType: databaseType
                                //     }));
                                // }}
                                onChange={
                                    handleDatabaseTypeChange
                                }
                            >

                                <option value="">
                                    -- Select Database Type --
                                </option>
                                <option value="MYSQL">
                                    MySQL
                                </option>

                                <option value="POSTGRESQL">
                                    PostgreSQL
                                </option>

                                <option value="H2">
                                    H2
                                </option>

                                <option value="MONGODB">
                                    MongoDB
                                </option>

                            </select>

                            {errors.databaseType && (

                                <small className="error">
                                    {errors.databaseType}
                                </small>

                            )}

                        </div>

                        <div className="database-field">

                            <label>
                                Connection URL
                            </label>

                            <input
                                type="text"
                                value={databaseConfig.url}
                                onChange={(e) =>
                                    setDatabaseConfig({
                                        ...databaseConfig,
                                        url: e.target.value
                                    })
                                }

                                placeholder={
                                    urlPlaceholders[
                                        databaseConfig.databaseType
                                    ]
                                }
                            />

                             {errors.url && (

                                <small className="error">
                                    {errors.url}
                                </small>

                            )}

                        </div>


                        {databaseConfig.databaseType !== "MONGODB" && (

                            <div className="database-field">

                                <label>
                                    Driver Class Name
                                </label>

                                <input
                                    type="text"
                                    value={
                                        databaseConfig.driverClassName
                                    }

                                    onChange={(e) =>
                                        setDatabaseConfig({
                                            ...databaseConfig,
                                            driverClassName:
                                                e.target.value
                                        })
                                    }

                                    placeholder={
                                        driverPlaceholders[
                                            databaseConfig.databaseType
                                        ]
                                    }
                                />

                                 {errors.driverClassName && (

                                    <small className="error">
                                        {
                                            errors.driverClassName
                                        }
                                    </small>

                                )}

                            </div>

                        )}
                        {databaseConfig.databaseType === "MONGODB" && (
                            <div className="database-field">

                                <label>
                                    Database Name
                                </label>

                                <input
                                    type="text"
                                    value={
                                        databaseConfig.databaseName
                                    }

                                    onChange={(e) =>
                                        setDatabaseConfig({
                                            ...databaseConfig,
                                            databaseName:
                                                e.target.value
                                        })
                                    }

                                    placeholder="formdb"
                                />

                                 {errors.databaseName && (

                                    <small className="error">
                                        {
                                            errors.databaseName
                                        }
                                    </small>

                                )}

                            </div>
                        )}

                        <div className="database-field">

                            <label>
                                Username
                            </label>

                            <input
                                type="text"
                                value={
                                    databaseConfig.username
                                }
                                onChange={(e) =>
                                    setDatabaseConfig({
                                        ...databaseConfig,
                                        username:
                                            e.target.value
                                    })
                                }
                                placeholder="Enter username"
                            />

                            {errors.username && (

                                <small className="error">
                                    {errors.username}
                                </small>

                            )}

                        </div>


                        <div className="database-field">

                            <label>
                                Password
                            </label>

                            <input
                                type="password"
                                value={
                                    databaseConfig.password
                                }
                                onChange={(e) =>
                                    setDatabaseConfig({
                                        ...databaseConfig,
                                        password:
                                            e.target.value
                                    })
                                }
                                placeholder="Enter password"
                            />

                            {errors.password && (

                                <small className="error">
                                    {errors.password}
                                </small>

                            )}

                        </div>

                        {/* CONNECTION ERROR */}

                        {errors.connection && (

                            <div className="connection-error">

                                {errors.connection}

                            </div>

                        )}

                    </div>


                    <div className="database-dialog-footer">

                        <button
                            className="database-cancel-button"
                            // onClick={() =>
                            //     setShowDatabaseDialog(false)
                            // }
                            onClick={onClose}
                        >
                            Cancel
                        </button>

                        <button
                            className="database-test-button"
                            //disabled={testing}
                            onClick={testConnection}
                        >

                            {testing
                                ? "Testing..."
                                : "Test & Continue"
                            }

                        </button>

                    </div>

                </div>

            </div>
  )
}

export default DatabaseDialogBox