
import { StyleSheet, View, Text, TextInput } from 'react-native';


export default function InputGroups({Label,mode,securityType,functionToDo,inputValue,editStatus}) {
    return (

        <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{Label}</Text>
            <TextInput style={styles.inputField} inputMode={mode} secureTextEntry={securityType} onChangeText={functionToDo} value={inputValue} editable={editStatus}  />
        </View>


    );
}

const styles = StyleSheet.create({

    inputGroup: {
        width: "90%",
        paddingHorizontal: 10,
        height: "auto",
        paddingVertical:8,
        color:"#000000",
    },
    inputField: {
        borderColor: "#000000",
        borderWidth: 1,
        marginTop: 5,
        fontSize:16,
        color:"#000000",
        height: 40,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 0,
        paddingStart:20,
        textAlign:"center",
    },
    inputLabel: {
        fontSize: 14,
        alignSelf:"center",
        color: "#00000",
        fontWeight: "bold"
    }
});
