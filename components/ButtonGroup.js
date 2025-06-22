import { StyleSheet, View, Text, Pressable } from 'react-native';


export default function ButtonGroups({Label,functionToDo}) {
    return (

        <View style={styles.btnGroup}>
        <Pressable style={styles.btn} onPress={functionToDo} hitSlop={20}>
               
            <Text style={styles.btnText}> {Label} </Text>
         
        </Pressable>
      </View>


    );
}

const styles = StyleSheet.create({

    btnGroup: {
        width: "86%",
        paddingHorizontal: 10,
        height: "auto",
        paddingVertical: 8,
        alignItems:"center",
        justifyContent:"center",
      },
      btn: {
        backgroundColor: "#FFB22C",
        color: "black",
        width: "100%",
        alignItems:"center",
        justifyContent:"center",
        height:40,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 0,
      },
      btnText:{
        color:"black",
        fontSize:16,
        fontWeight:"bold",
      }
});
